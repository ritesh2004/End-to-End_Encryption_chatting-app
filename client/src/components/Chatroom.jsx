import axios from "axios";
import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import forge from "node-forge";
import AuthContext from "../context/Authcontext";

export const Chatroom = ({ socket, recipaent }) => {
  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const [recipientPublicKey, setRecipientPublicKey] = useState("");
  const [isReady, setIsReady] = useState(false);

  const endofMessages = useRef(null);
  const buttonRef = useRef(null);

  const { user } = useContext(AuthContext);

  const scrollToBottom = () => {
    endofMessages?.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getSecretKey = useCallback(async () => {
    if (!recipaent || !recipaent.id) return;
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_FIREBASE_SERVER_URL}/api/v1/user/secret/${recipaent.id}`,
        {
          withCredentials: true,
        }
      );
      setRecipientPublicKey(data.user.publicKey);
    } catch (error) {
      console.error("Error fetching secret key:", error);
    }
  }, [recipaent]);

  const editLastmsg = async (id,lastmsg) => {
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_FIREBASE_SERVER_URL}/api/v1/user/edit/lastmsg/${id}`,{
        lastmsg
      },{
        withCredentials : true
      });

      console.log(data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getSecretKey();
  }, [getSecretKey]);

  useEffect(() => {
    if (user?.privateKey && recipientPublicKey) {
      setIsReady(true);
    }
  }, [user, recipientPublicKey]);

  useEffect(() => {
    if (!socket || !isReady) return;

    const handleReceiveMessage = async (msg) => {
      try {
        const decryptedMessage = decryptMessage(msg.message, false);
        if (decryptedMessage) {
          setAllMessages((prev) => [
            ...prev,
            { message: decryptedMessage, recipaent: msg.recipaent },
          ]);
        }
      } catch (error) {
        console.error("Error handling received message:", error);
      }
    };

    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [socket, isReady]);

  useEffect(() => {
    scrollToBottom();
  }, [allMessages]);

  useEffect(() => {
    const handleSubmit = (e) => {
      if (e.key === "Enter") {
        sendMessage();
      }
    }
    if (!buttonRef.current){
      return;
    }
    buttonRef.current.addEventListener("keypress", handleSubmit);
    return () => {
      buttonRef.current.removeEventListener("keypress", handleSubmit);
    }
  });

  const encryptMessage = useCallback(
    (message) => {
      if (!recipientPublicKey || !message) return null;

      try {
        const symmetricKey = forge.random.getBytesSync(16);
        const cipher = forge.cipher.createCipher("AES-CBC", symmetricKey);
        const iv = forge.random.getBytesSync(16);
        cipher.start({ iv: iv });
        cipher.update(forge.util.createBuffer(message));
        cipher.finish();
        const encryptedData = cipher.output.getBytes();

        const recipientpublicKey =
          forge.pki.publicKeyFromPem(recipientPublicKey);
        const senderpublicKey = forge.pki.publicKeyFromPem(user.publicKey);
        const recipientEncryptedSymmetricKey =
          recipientpublicKey.encrypt(symmetricKey);
        const senderEncryptedSymmetricKey =
          senderpublicKey.encrypt(symmetricKey);

        return JSON.stringify({
          data: forge.util.encode64(encryptedData),
          recipientKey: forge.util.encode64(recipientEncryptedSymmetricKey),
          senderKey: forge.util.encode64(senderEncryptedSymmetricKey),
          iv: forge.util.encode64(iv),
        });
      } catch (error) {
        console.error("Encryption failed:", error);
        return null;
      }
    },
    [recipientPublicKey, user]
  );

  const decryptMessage = useCallback(
    (encryptedMessage, isMe) => {
      if (!encryptedMessage || !user?.privateKey) return null;

      try {
        const encryptedPackage = JSON.parse(encryptedMessage);
        const encryptedData = forge.util.decode64(encryptedPackage.data);
        let encryptedSymmetricKey = null;
        if (isMe) {
          encryptedSymmetricKey = forge.util.decode64(
            encryptedPackage.senderKey
          );
        } else {
          encryptedSymmetricKey = forge.util.decode64(
            encryptedPackage.recipientKey
          );
        }
        const iv = forge.util.decode64(encryptedPackage.iv);

        const privateKey = forge.pki.privateKeyFromPem(user.privateKey);
        const symmetricKey = privateKey.decrypt(encryptedSymmetricKey);

        const decipher = forge.cipher.createDecipher("AES-CBC", symmetricKey);
        decipher.start({ iv: iv });
        decipher.update(forge.util.createBuffer(encryptedData));
        decipher.finish();

        return decipher.output.toString();
      } catch (error) {
        console.error("Decryption failed:", error);
        return null;
      }
    },
    [user]
  );

  const sendMessage = async () => {
    if (!message || !isReady) return;

    const encryptedMessage = encryptMessage(message);
    if (!encryptedMessage) {
      console.error("Failed to encrypt message");
      return;
    }

    socket.emit("send-message", {
      message: encryptedMessage,
      recipaent,
    });

    const { data } = await axios.post(
      `${import.meta.env.VITE_FIREBASE_SERVER_URL}/api/v1/chat/create`,
      {
        message: encryptedMessage,
        receiverId: recipaent.id,
        senderId: user.id,
      },
      {
        withCredentials: true,
      }
    );
    editLastmsg(user.id,message);
    editLastmsg(recipaent.id,message);
    setAllMessages((prev) => [...prev, { message, recipaent }]);
    setMessage("");
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_FIREBASE_SERVER_URL}/api/v1/chat/get`,
          {
            senderId: user.id,
            receiverId: recipaent.id,
          },
          {
            withCredentials: true,
          }
        );
        // setAllMessages(data.chats);
        console.log(data);
        if (data?.chats) {
          const messages = data.chats.map((msg) => {
            if (msg.from_id === user.id) {
              return {
                message: decryptMessage(msg.message, true),
                recipaent: { email: recipaent.email },
              };
            } else {
              return {
                message: decryptMessage(msg.message, false),
                recipaent: { email: user.email },
              };
            }
          });
          console.log(messages);
          setAllMessages(messages);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    if (isReady) {
      fetchMessages();
    }
  }, [isReady, recipaent]);

  if (!isReady) {
    return (
      <div className="h-[calc(100vh-160px)] w-full flex justify-center items-center">
        <div className="flex flex-col items-center gap-5">
          <div className="flex flex-row gap-5 items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="60"
              height="60"
              fill="#7FFFAB"
              className="bi bi-key"
              viewBox="0 0 16 16"
            >
              <path d="M0 8a4 4 0 0 1 7.465-2H14a.5.5 0 0 1 .354.146l1.5 1.5a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0L13 9.207l-.646.647a.5.5 0 0 1-.708 0L11 9.207l-.646.647a.5.5 0 0 1-.708 0L9 9.207l-.646.647A.5.5 0 0 1 8 10h-.535A4 4 0 0 1 0 8m4-3a3 3 0 1 0 2.712 4.285A.5.5 0 0 1 7.163 9h.63l.853-.854a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.793-.793-1-1h-6.63a.5.5 0 0 1-.451-.285A3 3 0 0 0 4 5" />
              <path d="M4 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              fill="#7FFFAB"
              className="bi bi-plus-lg"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"
              />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="50"
              height="50"
              fill="#7FFFAB"
              className="bi bi-shield-lock"
              viewBox="0 0 16 16"
            >
              <path d="M5.338 1.59a61 61 0 0 0-2.837.856.48.48 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.7 10.7 0 0 0 2.287 2.233c.346.244.652.42.893.533q.18.085.293.118a1 1 0 0 0 .101.025 1 1 0 0 0 .1-.025q.114-.034.294-.118c.24-.113.547-.29.893-.533a10.7 10.7 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.8 11.8 0 0 1-2.517 2.453 7 7 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7 7 0 0 1-1.048-.625 11.8 11.8 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 63 63 0 0 1 5.072.56" />
              <path d="M9.5 6.5a1.5 1.5 0 0 1-1 1.415l.385 1.99a.5.5 0 0 1-.491.595h-.788a.5.5 0 0 1-.49-.595l.384-1.99a1.5 1.5 0 1 1 2-1.415" />
            </svg>
          </div>
          <div>
            <h1 className="text-[#7FFFAB] font-mont text-xl font-medium">
              End-to-End Encrypted Chat
            </h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 relative overflow-y-hidden no-scrollbar" ref={buttonRef}>
      <div className="h-full mb-28">
        {allMessages.length > 0 &&
          allMessages.map((msg, index) => {
            return (
              <div
                key={index}
                className={
                  msg.recipaent.email === recipaent.email
                    ? "chat chat-end"
                    : "chat chat-start"
                }
              >
                <div
                  className={
                    msg.recipaent.email === recipaent.email
                      ? "chat-bubble bg-[#036825] font-mont text-white"
                      : "chat-bubble bg-[#272727] font-mont text-white"
                  }
                >
                  {msg.message}
                </div>
              </div>
            );
          })}
        <div ref={endofMessages}></div>
      </div>

      <div className="bg-[#282828] w-[90%] md:w-[57%] lg:w-[42%] xl:w-[48%] h-[64px] rounded-lg flex flex-row gap-5 items-center px-5 fixed bottom-5">
        <input
          className="w-[90%] rounded-lg h-[46px] bg-[#3C3C3C] px-5 text-[#7FFFAB] font-mont"
          type="text"
          name="message"
          id="message"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          className="h-[46px] w-[60px] flex justify-center items-center bg-[#3C3C3C] rounded-lg"
          onClick={sendMessage}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="#7FFFAB"
            className="bi bi-send"
            viewBox="0 0 16 16"
          >
            <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

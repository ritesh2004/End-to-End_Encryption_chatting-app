import axios from "axios";
import React, { useContext, useEffect, useState,useCallback } from "react";
import forge from "node-forge";
import AuthContext from "../context/Authcontext";

export const Chatroom = ({ socket, recipaent, privateKeypem }) => {
  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const [recipientPublicKey, setRecipientPublicKey] = useState("");
  const [isReady, setIsReady] = useState(false);

  const { user } = useContext(AuthContext);

  const getSecretKey = useCallback(async () => {
    if (!recipaent || !recipaent.id) return;
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/v1/user/secret/${recipaent.id}`,
        {
          withCredentials: true,
        }
      );
      setRecipientPublicKey(data.user.publicKey);
    } catch (error) {
      console.error("Error fetching secret key:", error);
    }
  }, [recipaent]);

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
        const decryptedMessage = decryptMessage(msg.message,false);
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

  const encryptMessage = useCallback((message) => {
    if (!recipientPublicKey || !message) return null;

    try {
      const symmetricKey = forge.random.getBytesSync(16);
      const cipher = forge.cipher.createCipher('AES-CBC', symmetricKey);
      const iv = forge.random.getBytesSync(16);
      cipher.start({ iv: iv });
      cipher.update(forge.util.createBuffer(message));
      cipher.finish();
      const encryptedData = cipher.output.getBytes();

      const recipientpublicKey = forge.pki.publicKeyFromPem(recipientPublicKey);
      const senderpublicKey = forge.pki.publicKeyFromPem(user.publicKey);
      const recipientEncryptedSymmetricKey = recipientpublicKey.encrypt(symmetricKey);
      const senderEncryptedSymmetricKey = senderpublicKey.encrypt(symmetricKey);

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
  }, [recipientPublicKey,user]);

  const decryptMessage = useCallback((encryptedMessage,isMe) => {
    if (!encryptedMessage || !user?.privateKey) return null;
    
    try {
      const encryptedPackage = JSON.parse(encryptedMessage);
      const encryptedData = forge.util.decode64(encryptedPackage.data);
      let encryptedSymmetricKey = null;
      if (isMe){
        encryptedSymmetricKey = forge.util.decode64(encryptedPackage.senderKey);
      }
      else{
        encryptedSymmetricKey = forge.util.decode64(encryptedPackage.recipientKey);
      }
      const iv = forge.util.decode64(encryptedPackage.iv);

      const privateKey = forge.pki.privateKeyFromPem(user.privateKey);
      const symmetricKey = privateKey.decrypt(encryptedSymmetricKey);

      const decipher = forge.cipher.createDecipher('AES-CBC', symmetricKey);
      decipher.start({ iv: iv });
      decipher.update(forge.util.createBuffer(encryptedData));
      decipher.finish();

      return decipher.output.toString();
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }, [user]);

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
      "http://localhost:5000/api/v1/chat/create",
      {
        message: encryptedMessage,
        receiverId: recipaent.id,
        senderId: user.id,
      },
      {
        withCredentials: true,
      }
    );

    setAllMessages((prev) => [...prev, { message, recipaent }]);
    setMessage("");
  };


  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await axios.post(
          "http://localhost:5000/api/v1/chat/get",
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
                message: decryptMessage(msg.message,true),
                recipaent: { email: recipaent.email },
              };
            } else {
              return {
                message: decryptMessage(msg.message,false),
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
    if (isReady){
      fetchMessages();
    }
  },[isReady]);

  if (!isReady) {
    return <div>Loading...</div>;
  }

  return (
    <div className="px-2 relative overflow-y-auto">
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

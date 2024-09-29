import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import forge from "node-forge";
import AuthContext from "../context/Authcontext";

export const Chatroom = ({ socket, recipaent, privateKeypem }) => {
  let decrypted;
  const [message, setMessage] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const [recipientPublicKey, setRecipientPublicKey] = useState("");
  // const [privateKeyPem, setPrivateKeyPem] = useState("");

  const { user } = useContext(AuthContext);

  useEffect(() => {
    console.log("Recipient in Chatroom: ", recipaent);
    // setPrivateKeyPem(privateKeypem);
    const getSecretKey = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/v1/user/secret/${recipaent.id}`,
          {
            withCredentials: true,
          }
        );
        // console.log("Secret Key: ", data);
        setRecipientPublicKey(data.user.publicKey);
      } catch (error) {
        console.log(error);
      }
    };
    getSecretKey();
  }, [recipaent]);

  useEffect(() => {
    if (!socket) return;
    socket.on("receive-message", async (msg) => {
      // console.log("Received Message: ", msg);
      const decryptedMessage = decryptMessage(msg.message);
      // console.log("Decrypted Message: ", decryptedMessage);
      if (decryptedMessage) {
        // Safely update the state
        setAllMessages((prev) => [
          ...prev,
          { message: decryptedMessage, recipaent: msg.recipaent },
        ]);
      }
    });
  }, [socket]);

  // Encrypt message with recipient's public key
  const encryptMessage = (message, recipientPublicKey) => {
    // console.log("Encryption Started");
    const publicKey = forge.pki.publicKeyFromPem(recipientPublicKey);
    // console.log("Public Key: ", publicKey);
    const encrypted = publicKey.encrypt(forge.util.encodeUtf8(message));
    // console.log("Encrypted: ", encrypted);
    return forge.util.encode64(encrypted); // Base64 encode the encrypted message
  };

  // Decrypt received message
  const decryptMessage = (encryptedMessage) => {
      // console.log("Decryption Started");
      const privateKey = forge.pki.privateKeyFromPem(user.privateKey);
      // console.log("Private Key: ", privateKey);
      const decodedMessage = forge.util.decode64(encryptedMessage);
      // console.log("Decoded Message: ", decodedMessage);
      decrypted = privateKey.decrypt(decodedMessage);
      // console.log("Decrypted: ", decrypted);
      return forge.util.decodeUtf8(decrypted);
  };

  const sendMessage = () => {
    if (!message) return;
    const encryptedMessage = encryptMessage(message, recipientPublicKey);
    socket.emit("send-message", {
      message: encryptedMessage,
      recipaent,
    });

    setAllMessages((prev) => [...prev, { message, recipaent }]);
    setMessage("");
  };

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

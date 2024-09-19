import { all } from "axios";
import React, { useEffect, useState } from "react";

export const Chatroom = ({ socket, recipaent, room }) => {
  const [message, setMessage] = useState("");
  // const [received, setReceived] = useState("");
  const [allMessages, setAllMessages] = useState([]);

  const sendMessage = () => {
    socket.emit("send-message", {
      message,
      recipaent,
      room,
    });
    setAllMessages((prev) => [...prev, { message, recipaent }]);
    setMessage("");
  };

  useEffect(() => {
    console.log("messages",allMessages);
  }, [allMessages]);

  useEffect(() => {
    if (!socket) return;
    socket.on("receive-message", (msg) => {
      // console.log(msg);
      // setReceived(msg);
      setAllMessages((prev) => [...prev, msg]);
      // console.log("messages",allMessages);
    });
  },[socket]);

  return (
    <div className="px-2 relative overflow-y-auto">
      <div className="h-full mb-28">
        {allMessages.length > 0 && allMessages.map((msg)=>{
          return (
            <div
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
          )
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
            class="bi bi-send"
            viewBox="0 0 16 16"
          >
            <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

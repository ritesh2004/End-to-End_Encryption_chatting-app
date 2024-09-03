import React from "react";
import { Chat } from "../../components/Chat";
import { Chatroom } from "../../components/Chatroom";

export const Home = () => {
  return (
    <div className="min-h-screen bg-[#090909] pt-5">
      <div className="mx-auto w-[95%] md:w-[90%] lg:w-[86%] xl:w-[80%] border-2 border-[#202020] h-[97px] flex flex-row items-center rounded-lg divide-x-4 divide-[#202020]">
        <div className="hidden md:flex md:w-[400px] flex-row items-center justify-around px-2">
          <h1 className="uppercase text-[#99FFAF] font-mont text-xl font-medium flex flex-row items-center gap-2">
            {" "}
            <svg
              width="35"
              height="35"
              viewBox="0 0 35 35"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="bg-[#1A1A1A] rounded-full p-1"
            >
              <path
                d="M13.6759 1.5L1.5 13.5L13.6759 21.9953M13.6759 21.9953V10.4906L22.5793 15.2849L13.6759 21.9953ZM13.6759 21.9953L23.5 27.7477L13.6759 33.5V21.9953Z"
                stroke="#99FFAF"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>{" "}
            chatapp
          </h1>
          <div className="avatar">
            <div className="ring-[#99FFAF] ring-offset-base-100 w-10 rounded-full ring-1 ring-offset-2">
              <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
            </div>
          </div>
        </div>

        <div className="px-10 flex flex-row gap-5 items-center">
          <div className="avatar">
            <div className="ring-[#99FFAF] ring-offset-base-100 w-10 rounded-full ring-1 ring-offset-2">
              <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
            </div>
          </div>
          <h2 className="text-[#FFFFFF] font-mont font-medium text-2xl">
            Jon Doe
          </h2>
        </div>
      </div>

      <div className="mx-auto w-[95%] md:w-[90%] lg:w-[86%] xl:w-[80%] border-2 border-[#202020] h-[calc(100vh-150px)] rounded-lg mt-5 flex flex-row gap-5 md:divide-x-4 md:divide-[#1C1C1C] my-2">
        <div className="hidden md:block md:w-[300px] lg:w-[400px] flex flex-col px-2 py-2 gap-5">
          <Chat />
          <Chat />
          <Chat />
          <Chat />
          <Chat />
        </div>
        <div className="w-full h-full overflow-y-auto">
          <Chatroom />
        </div>
      </div>
    </div>
  );
};

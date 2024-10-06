import React, { useContext } from "react";
import AuthContext from "../context/Authcontext";
import AsyncImgLoader from "./AsyncImgLoader";

export const Chat = ({photoURL,name,lastmsg, id}) => {
  const { user } =  useContext(AuthContext);
  return (
    <div className="md:w-[97%] lg:w-[95%] h-[59px] md:h-auto bg-[#141414] flex flex-row py-2 gap-2 items-center px-2 rounded-lg hover:bg-[#0000] cursor-pointer">
      <div className="avatar">
        <div className="w-12 rounded-full">
          <img src={photoURL} />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-[#7FFFAB] text-xl font-medium font-mont">{name}{" "}{user?.id === id ? "(You)" : ""}</span>
        <span className="text-sm text-[#FFFFFF] font-mont">{lastmsg ? lastmsg?.length > 33 ? lastmsg.slice(0,33) : lastmsg  : "Start your chat"}</span>
      </div>
    </div>
  );
};

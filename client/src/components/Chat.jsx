import React, { useContext } from "react";
import AuthContext from "../context/Authcontext";
import AsyncImgLoader from "./AsyncImgLoader";
import moment from "moment";

export const Chat = ({photoURL,name,lastseen, id, status}) => {
  const { user } =  useContext(AuthContext);
  return (
    <div className="md:w-[97%] lg:w-[95%] h-[59px] md:h-auto bg-[#141414] flex flex-row py-2 gap-2 items-center px-2 rounded-lg hover:bg-[#0000] cursor-pointer">
      <div className={status?.includes(id) ? "avatar online" : "avatar"}>
        <div className="w-12 rounded-full">
          <img src={photoURL} />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-[#7FFFAB] text-xl font-medium font-mont">{name}{" "}{user?.id === id ? "(You)" : ""}</span>
        <span className="text-sm text-[#FFFFFF] font-mont">{lastseen ? "Lastseen at " + moment(lastseen).format('h:mm A, MMMM Do')  : "Start your chat"}</span>
      </div>
    </div>
  );
};

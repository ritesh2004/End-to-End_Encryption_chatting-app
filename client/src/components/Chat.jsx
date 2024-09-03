import React from "react";

export const Chat = () => {
  return (
    <div className="md:w-[300px] lg:w-[400px] h-[59px] bg-[#141414] flex flex-row py-2 gap-2 items-center px-2 rounded-lg">
      <div className="avatar">
        <div className="w-12 rounded-full">
          <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-[#7FFFAB] text-xl font-medium font-mont">Gaurav Mehta</span>
        <span className="text-sm text-[#FFFFFF] font-mont">Lorem ipsum dolor sit amet.</span>
      </div>
    </div>
  );
};

import React from "react";

export const Chatroom = () => {
  return (
    <div className="px-2 relative overflow-y-auto">
      <div className="h-full mb-28">
        <div className="chat chat-start">
          <div className="chat-bubble bg-[#272727] font-mont text-white">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Omnis iste
            nisi voluptate, voluptatum itaque accusamus optio sapiente?
            Similique voluptates alias quaerat numquam eaque voluptatibus iste
            consequatur eius culpa enim aliquid possimus reiciendis id
            laudantium quam fuga perferendis, voluptate, sapiente eligendi
            recusandae! Obcaecati sapiente rerum dolores sit, quo quis porro
            asperiores!
          </div>
        </div>
        <div className="chat chat-end">
          <div className="chat-bubble bg-[#036825] font-mont text-white">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero vel
            dolore numquam necessitatibus molestiae culpa laudantium
            exercitationem beatae reiciendis itaque eligendi sit tempora omnis
            error nostrum dolor, unde assumenda dicta blanditiis. Id
            necessitatibus ad vitae at blanditiis eaque hic eveniet enim,
            incidunt doloribus veniam illum quis repudiandae vel. Doloremque
            dolores maiores eos soluta quisquam ipsa eum ipsam corrupti quas
            exercitationem aliquam veritatis vero libero quasi accusamus sunt,
            odio repellat quam! Reiciendis corporis alias ducimus totam
            laudantium quaerat laboriosam sit consectetur aut minus esse, harum
            eum adipisci culpa officiis, commodi iure quod! A commodi soluta sit
            officia rem dolores minus non?
          </div>
        </div>
        <div className="chat chat-start">
          <div className="chat-bubble bg-[#272727] font-mont text-white">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias
            repellat id ex dolore. Architecto accusamus amet fugit? Tempore, aut
            consequuntur.
          </div>
        </div>
      </div>

      <div className="bg-[#282828] w-[90%] md:w-[42%] lg:w-[42%] xl:w-[48%] h-[64px] rounded-lg flex flex-row gap-5 items-center px-5 fixed bottom-5">
        <input
          className="w-[90%] rounded-lg h-[46px] bg-[#3C3C3C] px-5 text-[#7FFFAB] font-mont"
          type="text"
          name="message"
          id="message"
          placeholder="Type a message..."
        />
        <button className="h-[46px] w-[60px] flex justify-center items-center bg-[#3C3C3C] rounded-lg">
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

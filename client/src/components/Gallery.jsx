import React, { useContext, useState } from 'react';
import Appcontext from '../context/Appcontext';

export const Gallery = () => {

    const { setShowGallery, setAvatar } = useContext(Appcontext);

    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const avatars = [
        "https://res.cloudinary.com/drctt42py/image/upload/v1728644229/chatapp-avatars/9_ogo64q.png",
        "https://res.cloudinary.com/drctt42py/image/upload/v1728654519/chatapp-avatars/Avatar_for_Chat_App_x3u1jz.png",
        "https://res.cloudinary.com/drctt42py/image/upload/v1728644229/chatapp-avatars/6_aw5ehm.png",
        "https://res.cloudinary.com/drctt42py/image/upload/v1728644228/chatapp-avatars/7_igflj0.png",
        "https://res.cloudinary.com/drctt42py/image/upload/v1728644228/chatapp-avatars/8_hq5dbl.png",
        "https://res.cloudinary.com/drctt42py/image/upload/v1728644228/chatapp-avatars/5_eum1cs.png",
        "https://res.cloudinary.com/drctt42py/image/upload/v1728644228/chatapp-avatars/1_dp0hq1.png",
        "https://res.cloudinary.com/drctt42py/image/upload/v1728644227/chatapp-avatars/4_hmna3n.png",
        "https://res.cloudinary.com/drctt42py/image/upload/v1728644227/chatapp-avatars/2_stzpcm.png",
        "https://res.cloudinary.com/drctt42py/image/upload/v1728644227/chatapp-avatars/3_yy6eby.png",
        "https://res.cloudinary.com/drctt42py/image/upload/v1728644226/chatapp-avatars/12_jl1gda.png",
        "https://res.cloudinary.com/drctt42py/image/upload/v1728644225/chatapp-avatars/11_tyatgy.png"
    ]

    const selectAvatar = () => {
        setAvatar(avatars[selectedAvatar]);
        setShowGallery(false);
    }

    return (
        <div className='absolute inset-0 z-[10] flex justify-center items-center'>
            <div className='md:w-[70%] md:h-auto lg:w-[50%] lg:h-auto bg-[#09090b] border border-[#7FFFAB] border-dashed p-5 rounded-xl flex flex-col justify-center gap-8'>
                <span className='text-[#7FFFAB] text-2xl font-bold text-center'>Choose Your Avatar</span>
                <div className='grid grid-cols-4 gap-8 pb-5'>
                    {avatars.map((avatar, id) => {
                        return (
                            selectedAvatar !== id ? <div key={id} className="avatar flex justify-center items-center cursor-pointer" onClick={() => setSelectedAvatar(id)}>
                                <div className="ring-primary ring-offset-base-100 w-24 rounded-full ring ring-offset-2">
                                    <img src={avatar} />
                                </div>
                            </div>
                                :
                                <div key={id} className="avatar flex justify-center items-center cursor-pointer">
                                    <div className="ring-primary ring-offset-base-100 w-24 rounded-full ring ring-offset-2 flex justify-center items-center">
                                        <img src="https://res.cloudinary.com/drctt42py/image/upload/v1728703895/chatapp-avatars/Avatar_for_Chat_App_1_vccnkb.png" />
                                    </div>
                                </div>
                        )
                    })
                    }
                </div>
                <button className='bg-[#7FFFAB] text-[#09090b] p-2 rounded-md' onClick={selectAvatar}>Select Avatar</button>
            </div>
        </div>
    )
}

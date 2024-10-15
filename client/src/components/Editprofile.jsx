import React, { useContext, useEffect, useRef, useState } from 'react';
import AuthContext from '../context/Authcontext';
import Appcontext from '../context/Appcontext';
import axios from 'axios';

export const Editprofile = () => {
    const [showEditPicture, setShowEditPicture] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const avatarRef = useRef(null);

    const { user } = useContext(AuthContext);
    const { setShowGallery,avatar,setAvatar,setShowEdit } = useContext(Appcontext);

    useEffect(() => {
        if (!avatarRef.current) return;

        const handleMouseEnter = () => {
            setShowEditPicture(true);
        };

        const handleMouseLeave = () => {
            setShowEditPicture(false);
        };

        avatarRef.current.addEventListener('mouseenter', handleMouseEnter);
        avatarRef.current.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            if (avatarRef.current) {
                avatarRef.current.removeEventListener('mouseenter', handleMouseEnter);
                avatarRef.current.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
    }, []);

    useEffect(() => {
        setUsername(user?.username);
        setEmail(user?.email);
        setAvatar(user?.photoURL);
    },[user]);

    const handleEditProfile = async () => {
        try {
            // checkUsernameEmail();
            if (error) return;

            const { data} = await axios.post(`${import.meta.env.VITE_FIREBASE_SERVER_URL}/api/v1/user/edit/profile`, {
                username,
                email,
                photoURL: avatar
            },{
                withCredentials: true
            })
            console.log(data);
            setShowEdit(false);
        } catch (error) {
            setError(error?.response?.data?.message);
            console.log(error);
        }
    } 

    return (
        <div className='absolute inset-0 flex justify-center items-center'>
            <div className='md:w-[40%] md:h-auto lg:w-[30%] lg:h-auto bg-[#09090b] border border-[#7FFFAB] border-dashed p-5 rounded-xl flex flex-col justify-center items-center gap-5' >
                <h1 className='text-3xl font-bold text-center text-[#7FFFAB]'>Edit Profile</h1>
                <div className="avatar relative cursor-pointer" ref={avatarRef} onClick={() => setShowGallery(true)}>
                    <div className="ring-primary ring-offset-base-100 w-24 rounded-full ring ring-offset-2 overflow-hidden">
                        <img src={avatar} alt="Profile" />
                        {showEditPicture && (
                            <div className='absolute inset-0 flex justify-center items-center bg-[#a3abba94] rounded-full'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#7FFFAB" className="bi bi-pencil" viewBox="0 0 16 16">
                                    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325" />
                                </svg>
                            </div>
                        )}
                    </div>
                </div>
                <div className='w-full flex flex-col gap-5'>
                    <input type='text' placeholder='Username' className='bg-[#09090b] border border-[#7FFFAB] text-[#7FFFAB] p-2 rounded-md' value={username} onChange={e=>setUsername(e.target.value)} />
                    <input type='email' placeholder='Email' className='bg-[#09090b] border border-[#7FFFAB] text-[#7FFFAB] p-2 rounded-md' value={email} onChange={e=>setEmail(e.target.value)} />
                    {error && <span className='text-[#ff0000] text-sm'>{error}</span>}
                    <button className='bg-[#7FFFAB] text-[#09090b] p-2 rounded-md' onClick={handleEditProfile}>Save Changes</button>
                    <button className='bg-[#09090b] text-[#7FFFAB] border border-dashed border-[#7FFFAB] p-2 rounded-md' onClick={()=>setShowEdit(false)}>Cancel</button>
                </div>
            </div>
        </div>
    );
};
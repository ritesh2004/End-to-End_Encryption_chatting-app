import React, { useState } from 'react';
import axios from 'axios';

export const Signup = ({setShowLogin,setShowGallery,setUsername,setEmail,setPassword,username,email,password}) => {
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(false);
    const isPasswordMatch = password === confirmPassword;
    const checkUsernameEmail = async () => {
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_FIREBASE_SERVER_URL}/api/v1/user/check`, {
                username,
                email
            });
            // console.log(data);
            setError(false);
            setShowGallery(true);
        } catch (error) {
            console.log(error);
            setError(true);
            setShowGallery(false);
        }
    };
    return (
        <div className='absolute inset-0 flex justify-center items-center'>
            <div className='md:w-[70%] md:h-auto lg:w-[50%] lg:h-auto bg-[#09090b] border border-[#7FFFAB] border-dashed p-5 rounded-xl flex flex-col justify-center gap-8'>
                <span className='text-[#7FFFAB] text-2xl font-bold text-center'>Sign Up</span>
                <div className='flex flex-col gap-5'>
                    <input type='text' placeholder='Username' className='bg-[#09090b] border border-[#7FFFAB] text-[#7FFFAB] p-2 rounded-md' value={username} onChange={e=>setUsername(e.target.value)} />
                    <input type='email' placeholder='Email' className='bg-[#09090b] border border-[#7FFFAB] text-[#7FFFAB] p-2 rounded-md' value={email} onChange={e=>setEmail(e.target.value)} />
                    <input type='password' placeholder='Password' className='bg-[#09090b] border border-[#7FFFAB] text-[#7FFFAB] p-2 rounded-md' value={password} onChange={e=>setPassword(e.target.value)} />
                    <input type='password' placeholder='Confirm Password' className='bg-[#09090b] border border-[#7FFFAB] text-[#7FFFAB] p-2 rounded-md' value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} />
                    {!isPasswordMatch && <span className='text-[#7FFFAB]'>Password does not match</span>}
                    {error && <span className='text-[#7FFFAB]'>Username and Email not available</span>}
                    <button className='bg-[#7FFFAB] text-[#09090b] p-2 rounded-md' onClick={checkUsernameEmail}>Sign Up</button>
                    <div className='flex items-center justify-between'>
                        <span className='text-[#7FFFAB]'>Already have an account?</span>
                        <a href='#' className='text-[#7FFFAB]' onClick={()=>setShowLogin(true)}>Login</a>
                    </div>
                </div>
            </div>
        </div>
    )
}

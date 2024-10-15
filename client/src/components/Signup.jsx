import React, { useContext, useState } from 'react';
import axios from 'axios';
import forge from 'node-forge';
import Appcontext from '../context/Appcontext';

export const Signup = () => {

    const { setShowGallery,setShowLogin,setShowSignup,avatar } = useContext(Appcontext);

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const isPasswordMatch = password === confirmPassword;

    const register = async () => {
        try {
            const { publicKey, privateKey } = forge.pki.rsa.generateKeyPair({
                bits: 2048,
                e: 0x10001,
            });
            const publicKeyPem = forge.pki.publicKeyToPem(publicKey);
            const privateKeyPem = forge.pki.privateKeyToPem(privateKey);
            const { data } = await axios.post(`${import.meta.env.VITE_FIREBASE_SERVER_URL}/api/v1/user/create`, {
                username,
                email,
                password,
                photoURL: avatar,
                publicKey: publicKeyPem,
                privateKey: privateKeyPem
            })
            setUsername('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setShowSignup(false);
            setShowLogin(true);
        } catch (error) {
            console.log(error);
            setError(error?.response?.data?.message);
        }
    }

    const handleRegister = async () => {
        // await checkUsernameEmail();
        // if (error) return;
        if (!isPasswordMatch) return;
        await register();
    };

    return (
        <div className='absolute inset-0 flex justify-center items-center'>
            <div className='md:w-[70%] md:h-auto lg:w-[50%] lg:h-auto bg-[#09090b] border border-[#7FFFAB] border-dashed p-5 rounded-xl flex flex-col justify-center gap-8'>
                <span className='text-[#7FFFAB] text-2xl font-bold text-center'>Sign Up</span>
                <div className='flex flex-col gap-5'>
                    <div className='grid grid-cols-2 gap-5'>
                        <input type='text' placeholder='Username' className='bg-[#09090b] border border-[#7FFFAB] text-[#7FFFAB] p-2 rounded-md' value={username} onChange={e=>setUsername(e.target.value)} />
                        <button className='bg-[#7FFFAB] text-[#09090b] p-2 rounded-md' onClick={()=>setShowGallery(true)}>Select Avatar</button>
                    </div>
                    <input type='email' placeholder='Email' className='bg-[#09090b] border border-[#7FFFAB] text-[#7FFFAB] p-2 rounded-md' value={email} onChange={e=>setEmail(e.target.value)} />
                    <input type='password' placeholder='Password' className='bg-[#09090b] border border-[#7FFFAB] text-[#7FFFAB] p-2 rounded-md' value={password} onChange={e=>setPassword(e.target.value)} />
                    <input type='password' placeholder='Confirm Password' className='bg-[#09090b] border border-[#7FFFAB] text-[#7FFFAB] p-2 rounded-md' value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} />
                    {!isPasswordMatch && <span className='text-[#7FFFAB]'>Password does not match</span>}
                    {error && <span className='text-[#7FFFAB]'>{error}</span>}
                    <button className='bg-[#7FFFAB] text-[#09090b] p-2 rounded-md' onClick={handleRegister}>Sign Up</button>
                    <div className='flex items-center justify-between'>
                        <span className='text-[#7FFFAB]'>Already have an account?</span>
                        <button className='text-[#7FFFAB]' onClick={()=>{setShowLogin(true) 
                        setShowSignup(false)}}>Login</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

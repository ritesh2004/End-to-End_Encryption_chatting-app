import axios from 'axios';
import React, { useContext, useState } from 'react'
import AuthContext from '../context/Authcontext';
import Appcontext from '../context/Appcontext';

export const Login = () => {

    const { setShowLogin,setShowSignup } = useContext(Appcontext);

    const [usernameOrEmail,setUsernameOrEmail] = useState('');
    const [password,setPassword] = useState('');
    const [error, setError] = useState('');

    const { user, setUser } = useContext(AuthContext);

    const handleLogin = async () => {
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_FIREBASE_SERVER_URL}/api/v1/user/login`,{
                user : usernameOrEmail,
                password
            },{
                withCredentials : true
            });
            console.log(data);
            setUser(data?.user);
            setShowLogin(false);
            setUsernameOrEmail('');
            setPassword('');
        } catch (error) {
            console.log(error?.response?.data?.message)
            setError(error?.response?.data?.message);
        }
    }

    return (
        <div className='absolute inset-0 flex justify-center items-center'>
            <div className='md:w-[70%] md:h-auto lg:w-[50%] lg:h-auto bg-[#09090b] border border-[#7FFFAB] border-dashed p-5 rounded-xl flex flex-col justify-center gap-8'>
                <span className='text-[#7FFFAB] text-2xl font-bold text-center'>Log In</span>
                <div className='flex flex-col gap-5'>
                    <input type='text' placeholder='Username or Email' className='bg-[#09090b] border border-[#7FFFAB] text-[#7FFFAB] p-2 rounded-md' value={usernameOrEmail} onChange={e=>setUsernameOrEmail(e.target.value)} />
                    <input type='password' placeholder='Password' className='bg-[#09090b] border border-[#7FFFAB] text-[#7FFFAB] p-2 rounded-md' value={password} onChange={e=>setPassword(e.target.value)} />
                    {error && <span className='text-[#7FFFAB]'>{error}</span>}
                    <button className='bg-[#7FFFAB] text-[#09090b] p-2 rounded-md' onClick={handleLogin}>Log In</button>
                    <div className='flex items-center justify-between'>
                        <span className='text-[#7FFFAB]'>Don't have an account?</span>
                        <button className='text-[#7FFFAB]' onClick={()=>{setShowSignup(true)
                        setShowLogin(false)}}>Create Account</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

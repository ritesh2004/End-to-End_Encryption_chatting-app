import React, { useContext, useEffect, useState } from "react";
import { Chat } from "../../components/Chat";
import { Chatroom } from "../../components/Chatroom";
import axios from "axios";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import app from "../../Firebase";
import AuthContext from "../../context/Authcontext";
import { io } from "socket.io-client";
import AsyncImgLoader from "../../components/AsyncImgLoader";
import forge from "node-forge";

export const Home = () => {
  // Socket io initialization
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  const { user, setUser } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [recipaent, setRecipaent] = useState();
  const [socket,setSocket] = useState();
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');

  const login = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log(user);
      const { displayName, email } = user;
      const { data } = await axios.post(
        "http://localhost:5000/api/v1/user/create",
        {
          name: displayName,
          email: email,
          provider: "google",
          photoURL: user.providerData[0].photoURL,
        },
        {
          withCredentials: true,
        }
      );
      console.log(data);
      setUser(data?.user);
    } catch (error) {
      console.log(error);
    }
  };

  const getUser = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/v1/user/verify",
        {
          withCredentials: true,
        }
      );
      console.log(data);
      setUser(data?.user);
    } catch (error) {
      document.getElementById("my_modal_1").showModal();
    }
  };

  const getAllUsers = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/v1/users", {
        withCredentials: true,
      });
      console.log(data);
      setUsers(data?.users);
    } catch (error) {
      console.log(error);
    }
  };

  const updateSocketId = async (socketId) => {
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/v1/user/edit/socket",
        {
          socketId: socketId,
        },
        {
          withCredentials: true,
        }
      );
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  const updatePublicKey = async (key) => {
    try {
      const { data } = await axios.post("http://localhost:5000/api/v1/user/edit/publickey", {
        publickey: key,
      },{
        withCredentials: true,
      });
      console.log(data);
    }
    catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    getAllUsers();
  }, [user]);

  useEffect(() => {
    // Generate RSA key pair on load
    const { publicKey, privateKey } = forge.pki.rsa.generateKeyPair(2048);
    const publicKeyPem = forge.pki.publicKeyToPem(publicKey);
    const privateKeyPem = forge.pki.privateKeyToPem(privateKey);
    console.log(publicKeyPem);
    console.log(privateKeyPem);
    updatePublicKey(publicKeyPem);
    setPublicKey(publicKeyPem);
    setPrivateKey(privateKeyPem);
  }, []);

  // Handling socket io
  // client-side
  useEffect(()=>{
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    return () => {
      if (newSocket){
        newSocket.disconnect();
      }
    }
  },[]);

  useEffect(()=>{
    if (!socket) return;

    socket.on("connect", () => {
      console.log("connected");
      console.log(socket.id); // x8WIv7-mJelg7on_ALbx
      updateSocketId(socket.id);
    });
  
    socket.on("disconnect", () => {
      console.log(socket.id); // undefined
    });
  },[socket]);
  

  return (
    <div className="min-h-screen bg-[#090909] pt-5">
      <div className="mx-auto w-[95%] md:w-[90%] lg:w-[86%] xl:w-[80%] border-2 border-[#202020] h-[97px] flex flex-row items-center rounded-lg divide-x-4 divide-[#202020]">
        <div className="hidden md:flex md:w-[47.33%] lg:w-1/3 flex-row items-center justify-around px-2">
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
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>{" "}
            chatapp
          </h1>
          <div className="avatar">
            <div className="ring-[#99FFAF] ring-offset-base-100 w-10 rounded-full ring-1 ring-offset-2">
              {!user ? (
                <AsyncImgLoader src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"/>
              ) : (
                <AsyncImgLoader src={user.photoURL} />
              )}
            </div>
          </div>
        </div>

        <div className="w-2/3 px-10 flex flex-row gap-5 items-center">
          <div className="avatar">
            <div className="ring-[#99FFAF] ring-offset-base-100 w-10 rounded-full ring-1 ring-offset-2">
              {!recipaent ? (
                <AsyncImgLoader src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"/>
              ) : (
                <AsyncImgLoader src={recipaent.photoURL} />
              )}
            </div>
          </div>
          <div>
            {!recipaent ? <h2 className="text-[#FFFFFF] font-mont font-medium text-2xl">
              Jon Doe
            </h2>: <h2 className="text-[#FFFFFF] font-mont font-medium text-2xl">
              {recipaent.fullname}
            </h2>}
            <p className="text-[#99FFAF] font-mont font-medium text-sm">
              Online
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto w-[95%] md:w-[90%] lg:w-[86%] xl:w-[80%] border-2 border-[#202020] h-[calc(100vh-150px)] rounded-lg mt-5 flex flex-row md:divide-x-4 md:divide-[#1C1C1C] my-2">
        <div className="hidden md:h-auto md:overflow-y-auto md:block md:w-[320px] lg:w-1/3 md:flex md:flex-col md:px-2 md:py-2 md:gap-2">
          {users.map((user) => (
            <div key={user.id} onClick={()=>setRecipaent(user)}>
              <Chat
                key={user.id}
                photoURL={user.photoURL}
                name={user.fullname}
                id={user.id}
              />
            </div>
          ))}
        </div>
        <div className="w-full lg:w-2/3 h-full overflow-y-auto">
          <Chatroom socket={socket} recipaent={recipaent} privateKeypem={privateKey} />
        </div>
      </div>

      <dialog id="my_modal_1" className="modal backdrop-blur-sm bg-black/30">
        <div className="modal-box bg-[#09090b] border border-[#7FFFAB] border-dashed">
          <h3 className="font-bold text-lg text-white">Login to Chat</h3>
          <p className="py-4">
            You need to login to chat with other users. Please login to
            continue.
          </p>
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-outline btn-accent" onClick={login}>
                Login with Google
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

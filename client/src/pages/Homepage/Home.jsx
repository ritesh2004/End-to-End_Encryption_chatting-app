import React, { useContext, useEffect, useState } from "react";
import { Chat } from "../../components/Chat";
import { Chatroom } from "../../components/Chatroom";
import axios from "axios";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import app from "../../Firebase";
import AuthContext from "../../context/Authcontext";
import { io } from "socket.io-client";
import forge from "node-forge";
import { Gallery } from "../../components/Gallery";
import { Signup } from "../../components/Signup";
import { Login } from "../../components/Login";
import { Editprofile } from "../../components/Editprofile";
import Appcontext from "../../context/Appcontext";

export const Home = () => {
  // Socket io initialization
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  const { user, setUser } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [recipaent, setRecipaent] = useState();
  const [socket, setSocket] = useState();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [hasUnseen, setHasUnseen] = useState({});

  const { showLogin, setShowLogin, showSignup, setShowSignup, showGallery, setShowGallery, showEdit, setShowEdit } = useContext(Appcontext);

  const [avatar, setAvatar] = useState(null);

  const [name, setName] = useState(user?.fullname);
  const [image, setImage] = useState();

  const login = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // console.log(user);
      const { publicKey, privateKey } = forge.pki.rsa.generateKeyPair({
        bits: 2048,
        e: 0x10001,
      });
      const publicKeyPem = forge.pki.publicKeyToPem(publicKey);
      const privateKeyPem = forge.pki.privateKeyToPem(privateKey);
      // console.log(publicKeyPem);
      // console.log(privateKeyPem);
      const { displayName, email } = user;
      const { data } = await axios.post(
        `${import.meta.env.VITE_FIREBASE_SERVER_URL}/api/v1/user/create`,
        {
          name: displayName,
          email: email,
          provider: "google",
          photoURL: user.providerData[0].photoURL,
          publicKey: publicKeyPem,
          privateKey: privateKeyPem,
        },
        {
          withCredentials: true,
        }
      );
      // console.log(data);
      setUser(data?.user);
    } catch (error) {
      console.log(error);
    }
  };

  const logout = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_FIREBASE_SERVER_URL}/api/v1/user/logout`,
        {
          withCredentials: true,
        }
      );
      console.log(data);
      setUser(null);
    } catch (error) {
      console.log(error);
    }
  };

  const uploadImage = async () => {
    try {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("cloud_name", "drctt42py");
      formData.append("upload_preset", "rpBucket");
      const { data } = await axios.post("https://api.cloudinary.com/v1_1/drctt42py/image/upload", formData);
      return data?.url;
    }
    catch (error) {
      console.log(error)
    }
  }

  const editProfile = async () => {
    try {
      const imgUrl = await uploadImage();
      console.log(imgUrl)
      if (!name) return
      const { data } = await axios.post(
        `${import.meta.env.VITE_FIREBASE_SERVER_URL}/api/v1/user/edit/profile`,
        {
          name,
          photoURL: imgUrl
        },
        {
          withCredentials: true
        }
      );
      // console.log(data)
      setUser(data.user)
      setName("");
      setImage(null);
    } catch (error) {
      console.log(error)
    }
  };

  const getUser = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_FIREBASE_SERVER_URL}/api/v1/user/verify`,
        {
          withCredentials: true,
        }
      );
      // console.log(data);
      setUser(data?.user);
      setName(data?.user?.fullname)
    } catch (error) {
      // document.getElementById("my_modal_1").showModal();
      setShowLogin(true);
    }
  };

  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_FIREBASE_SERVER_URL}/api/v1/users`, {
        withCredentials: true,
      });
      // console.log(data);
      setUsers(data?.users);
    } catch (error) {
      console.log(error);
    }
  };

  const updateSocketId = async (socketId) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_FIREBASE_SERVER_URL}/api/v1/user/edit/socket`,
        {
          socketId: socketId,
        },
        {
          withCredentials: true,
        }
      );
      // console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  // When user logs in fetch users and ensure socket is connected
  useEffect(() => {
    if (!user) return;
    // fetch user list by REST (fallback) and ensure socket reconnects so server can authenticate socket
    getAllUsers();
    if (socket && !socket.connected) {
      socket.connect();
    }
  }, [user, socket]);

  // useEffect(()=>{
  //   if (!socket && !user) return;
  //   socket.emit("status",user?.id);
  // },[user])

  // Handling socket io
  // client-side
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_FIREBASE_SERVER_URL, {
      autoConnect: false,
      withCredentials: true,
      // force use of websocket transport to avoid engine.io polling session reuse errors
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    setSocket(newSocket);

    const onConnect = () => {
      console.log("socket connected", newSocket.id);
      if (newSocket.id) updateSocketId(newSocket.id);
    };
    const onUsers = (data) => {
      // server may send either an array or { users: [] }
      if (Array.isArray(data)) {
        setUsers(data);
      } else if (Array.isArray(data?.users)) {
        setUsers(data.users);
      } else {
        setUsers([]);
      }
    };
    const onStatus = (data) => {
      // server sends full array -> normalize IDs to string and replace state
      if (Array.isArray(data)) {
        setOnlineUsers(data.map((id) => String(id)));
      } else {
        setOnlineUsers([]);
      }
    };
    const onReceiveMessage = (payload) => {
      // payload: { message, from, to }
      const fromId = String(payload.from);
      // if open chat is with sender, don't mark unseen
      if (recipaent && String(recipaent.id) === fromId) return;
      setHasUnseen(prev => ({ ...prev, [fromId]: true }));
    };
    const onUserConnected = ({ id }) => {
      console.log("User connected:", id);
      setOnlineUsers((prev) => [...prev, String(id)]);
    };
    const onConnectError = (err) => {
      console.warn("socket connect_error", err);
    };

    newSocket.on("connect", onConnect);
    newSocket.on("users", onUsers);
    newSocket.on("status", onStatus);
    newSocket.on("receive-message", onReceiveMessage);
    newSocket.on("user-connected", onUserConnected);
    newSocket.on("connect_error", onConnectError);

    // start connect attempt
    newSocket.connect();

    return () => {
      newSocket.off("connect", onConnect);
      newSocket.off("users", onUsers);
      newSocket.off("status", onStatus);
      newSocket.off("receive-message", onReceiveMessage);
      newSocket.off("connect_error", onConnectError);
      newSocket.disconnect();
    };
  }, []);

  // clear unseen when selecting a recipient
  const handleSelectRecipient = (user) => {
    setRecipaent(user);
    setHasUnseen(prev => {
      const next = { ...prev };
      delete next[String(user.id)];
      return next;
    });
  };

  return (
    <div className="relative min-h-screen bg-[#090909] pt-5">
      <div className="mx-auto w-[95%] md:w-[90%] lg:w-[86%] xl:w-[80%] border-2 border-[#202020] h-[97px] flex flex-row items-center rounded-lg divide-x-4 divide-[#202020]">
        <div className="hidden md:block md:flex md:w-[320px] lg:w-1/3 flex-row items-center justify-around md:px-5">
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
            <span className="md:hidden lg:block">chatapp</span>
          </h1>
          <div className="dropdown">
            <div tabIndex={0} role="button">
              <div className="avatar">
                <div className="ring-[#99FFAF] ring-offset-base-100 w-10 rounded-full ring-1 ring-offset-2">
                  {!user ? (
                    <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                  ) : (
                    <img src={user.photoURL} />
                  )}
                </div>
              </div>
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-[#09090b] border border-[#7FFFAB] border-dashed rounded-box z-[1] w-52 p-2 gap-2"
            >
              <li className="bg-transparent hover:bg-[#7cb518] border border-[#7FFFAB] border-dashed rounded-lg">
                <span
                  className="text-[#7FFFAB] hover:text-white"
                  onClick={() =>
                    // document.getElementById("update-profile").showModal()
                    setShowEdit(true)
                  }
                >
                  EDIT PROFILE
                </span>
              </li>
              <li className="bg-transparent hover:bg-[#c32f27] border border-[#7FFFAB] border-dashed rounded-lg">
                <span
                  className="text-[#7FFFAB] hover:text-white"
                  onClick={logout}
                >
                  LOG OUT
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="w-full lg:w-2/3 pl-8 lg:px-10 flex flex-row gap-5 items-center">
          <div className="avatar">
            <div className="ring-[#99FFAF] ring-offset-base-100 w-10 rounded-full ring-1 ring-offset-2">
              {!recipaent ? (
                <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
              ) : (
                <img src={recipaent.photoURL} />
              )}
            </div>
          </div>
          <div>
            {!recipaent ? (
              <h2 className="text-[#FFFFFF] font-mont font-medium text-2xl">
                Jon Doe
              </h2>
            ) : (
              <h2 className="text-[#FFFFFF] font-mont font-medium text-2xl">
                {recipaent.username}
              </h2>
            )}
            <p className="text-[#99FFAF] font-mont font-medium text-sm">
              {onlineUsers?.includes(String(recipaent?.id)) ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto w-[95%] md:w-[90%] lg:w-[86%] xl:w-[80%] border-2 border-[#202020] h-[calc(100vh-150px)] rounded-lg mt-5 flex flex-row md:divide-x-4 md:divide-[#1C1C1C] my-2">
        <div className="hidden md:h-auto md:overflow-y-auto md:block md:w-[320px] lg:w-1/3 md:flex md:flex-col md:px-2 md:py-2 md:gap-2">
          {users.map((user) => (
            <div key={user.id} onClick={() => handleSelectRecipient(user)}>
              <Chat
                key={user.id}
                photoURL={user?.photoURL}
                name={user.username}
                id={user.id}
                lastseen={user.lastseen}
                status={onlineUsers}
                unseen={!!hasUnseen[String(user.id)]}
              />
            </div>
          ))}
        </div>
        <div className="w-full lg:w-2/3 h-full overflow-y-auto">
          <Chatroom socket={socket} recipaent={recipaent} />
        </div>
      </div>
      {/* Login modal  */}
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
      {/* <Dialogbox/> */}

      {/* update profile modal  */}
      {/* Open the modal using document.getElementById('ID').showModal() method */}
      <dialog id="update-profile" className="modal">
        <div className="modal-box bg-[#09090b] border border-[#7FFFAB] border-dashed">
          <h3 className="font-semibold text-lg text-[#7FFFAB]">Edit Profile</h3>
          <div className="w-full flex flex-col justify-center items-center">
            <div className="w-[85%] flex flex-row justify-between items-center pt-10">
              <label
                htmlFor="helper-text"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Name
              </label>
              <input
                type="text"
                id="helper-text"
                aria-describedby="helper-text-explanation"
                className="bg-transparent border border-[#7FFFAB] border-dashed text-white text-sm rounded-lg focus:ring-[#7FFFAB] focus:border-[#7FFFAB] block w-[60%] p-2.5"
                placeholder="E.g. Jon Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="w-[85%] flex flex-row justify-between items-center py-10">
              <label
                htmlFor="helper-text"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Profile Picture
              </label>
              <input
                type="file"
                id="helper-text"
                aria-describedby="helper-text-explanation"
                className="bg-transparent border border-[#7FFFAB] border-dashed text-white text-sm rounded-lg focus:ring-[#7FFFAB] focus:border-[#7FFFAB] block w-[60%] p-2.5"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </div>
          </div>

          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn bg-transparent border border-[#7FFFAB] border-dashed hover:bg-[#7FFFAB] hover:text-black" onClick={editProfile}>Save Changes</button>
            </form>
          </div>
        </div>
      </dialog>
      {showLogin && <Login />}
      {showSignup && <Signup />}
      {showGallery && <Gallery />}
      {/* <Editprofile/> */}
      {showEdit && <Editprofile />}
    </div>
  );
};

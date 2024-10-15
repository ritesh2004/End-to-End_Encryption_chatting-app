import { createContext, useState } from "react";

const Appcontext = createContext();

export default Appcontext;

export const AppProvide = ({children}) => {
    const [showLogin, setShowLogin] = useState(false);
    const [showSignup, setShowSignup] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [avatar, setAvatar] = useState('');

    return (
        <Appcontext.Provider value={{
            showLogin,
            setShowLogin,
            showSignup,
            setShowSignup,
            showGallery,
            setShowGallery,
            showEdit,
            setShowEdit,
            avatar,
            setAvatar
        }}>
            {children}
        </Appcontext.Provider>
    )
}
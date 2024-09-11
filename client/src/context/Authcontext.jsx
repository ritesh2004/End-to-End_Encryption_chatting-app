import { createContext, useState } from "react";

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  let values = {
    user,
    setUser,
  };
  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};

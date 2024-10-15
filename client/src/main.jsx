import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/Authcontext.jsx";
import { AppProvide } from "./context/Appcontext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <AppProvide>
        <App />
      </AppProvide>
    </AuthProvider>
  </StrictMode>
);

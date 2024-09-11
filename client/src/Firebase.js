// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBoxuVryCO2sKEv2BGbPgdIbXkfA7KACI8",
  authDomain: "end-to-end-chat-96fba.firebaseapp.com",
  projectId: "end-to-end-chat-96fba",
  storageBucket: "end-to-end-chat-96fba.appspot.com",
  messagingSenderId: "16400455915",
  appId: "1:16400455915:web:e11d974793b60c4f8446ae"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;
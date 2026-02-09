// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6Ki5yjTFGTo7tc2FPGyIiijXOSviQ6QY",
  authDomain: "fir-auth-ea525.firebaseapp.com",
  projectId: "fir-auth-ea525",
  storageBucket: "fir-auth-ea525.firebasestorage.app",
  messagingSenderId: "101009647307",
  appId: "1:101009647307:web:cf0dc541f40943970a1d4e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
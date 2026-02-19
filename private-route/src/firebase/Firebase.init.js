// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCx2L7VIU6xv3TEW7GwAyskfLmm4VLVFEE",
  authDomain: "private-route-7b1c1.firebaseapp.com",
  projectId: "private-route-7b1c1",
  storageBucket: "private-route-7b1c1.firebasestorage.app",
  messagingSenderId: "673591391954",
  appId: "1:673591391954:web:8fe40de6855cfe60dc5f0b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
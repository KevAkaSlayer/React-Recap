import React from "react";
import Button from "@mui/material/Button";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import auth from "../../firebase/firebase.init";
import { useNavigate } from "react-router";
import Navbar from "../../components/Header/Navbar";
import { Helmet } from "react-helmet-async";

export default function Login() {
  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();
  const handleLogin = () => {
    signInWithPopup(auth, googleProvider).then((result) => {
      const user = result.user;
      <Navbar user={user}></Navbar>;
      navigate("/");
    });
  };
  return (
    <div className="flex p-6 justify-center items-center">
      <Helmet>
        <title>Login | Book Vibe</title>
      </Helmet>
      <Button onClick={handleLogin} variant="outlined">
        Login with google
      </Button>
    </div>
  );
}

import React, { useState } from "react";
import { GoogleAuthProvider, signInWithPopup,signOut  } from "firebase/auth";
import { auth } from "../../firebase/firebase.init";

export default function Login() {
  const [user, setUser] = useState(null);
  const provider = new GoogleAuthProvider();
  const handleGoogleSignIn = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        setUser(result.user);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleSignOut =()=>{
    signOut(auth)
    .then(()=>{
        alert("sign out successfully")
    })
    .catch((error)=>{
        console.log(error)
    })
  }
  return (
    <div>
      <h1>Login</h1>
      <button onClick={handleGoogleSignIn}>Login with google</button>
      {
        user && <div>
        <h3>{user?.displayName}</h3>
        <h3>{user?.email}</h3>
      </div>
      }
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  );
}

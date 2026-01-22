import { useState } from "react"

useState
export const LoginCard =()=> {
  const [isLoggedIn, setIsLoggedIn]  = useState(false);
  const [message, setMessage] = useState("");

  const handleChange =(e)=>{
    setMessage(e.target.value);
  }


  const handleLogin = () =>{
    setIsLoggedIn(!isLoggedIn)
  }
  return (
    <>
    <button onClick={handleLogin}>{isLoggedIn ? "Logout" : "Login"}</button>
    <div>
        <input type="text" placeholder="Type a message" value = {message} onChange = {handleChange}/>
    </div>
    <p>{message}</p>
    </>
  )
}

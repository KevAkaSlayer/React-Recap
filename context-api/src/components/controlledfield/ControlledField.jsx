import React, { useState } from "react";

export default function ControlledField() {
    const [password,setPassword] = useState('');
    const [error, setError] = useState("")


  const handleSubmit = (e) => {
    e.preventDefault()
  };

  const handlePasswordOnChange=(e)=>{
    console.log(e.target.value)
    setPassword(e.target.value)

    if(password.length < 6){
        setError('Password must be 6 characters or longer')
    }else {
        setError("");
    }
  }
  return (
    <div>
      <h1>Controlled Field</h1>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" required />
        <br />
        <input
          type="password"
          name="password"
          onChange={handlePasswordOnChange}
          defaultValue={password}
          placeholder="Password"
          required
        />
        <input type="submit" value="Submit" />
      </form>
      <p style={{color:'red'}}><small>{error}</small></p>
    </div>
  );
}

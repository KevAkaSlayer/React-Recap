import { useState } from "react";
import "./App.css";

function App() {
  const handleAddUser = (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const newUser = {
      name,
      email,
    };

    fetch("http://localhost:3000/users", {
      method: "POST",
      header: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newUser),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.insertedId) {
          alert("user Added successfully");
          e.target.reset();
        }
      });
  };
  return (
    <>
      <h1>Simple CRUD Operation</h1>

      <form onSubmit={handleAddUser}>
        <input type="text" name="name" />
        <br />
        <input type="email" name="email" />
        <br />
        <input type="submit" value="Add User" />
      </form>
    </>
  );
}

export default App;

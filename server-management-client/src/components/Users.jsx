import React, { use, useState } from "react";

export default function Users({ userPromise }) {
  const initialUsers = use(userPromise);
  const [users, setUsers] = useState(initialUsers);

  const handleAddUser = (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const user = { name, email };
    console.log(user);

    fetch("http://localhost:3000/users", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(user),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("new user from server", data);
        const newUsers = [...users, data];
        setUsers(newUsers);
        e.target.reset();
      });
  };

  return (
    <div>
      <form onSubmit={handleAddUser}>
        <input type="text" name="name" />
        <br />
        <input type="email" name="email" />
        <br />
        <input type="submit" value="add user" />
      </form>

      <div>
        {users.map((user) => (
          <p key={user.id}>
            {user.name}: {user.email}
          </p>
        ))}
      </div>
    </div>
  );
}

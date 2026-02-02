import React from "react";
import { useLoaderData } from "react-router";
import User from "../User/User";

export default function Users() {
  const users = useLoaderData();
  console.log(users);
  return (
    <div>
      <h1>This is users data</h1>
        {users.map((user, index) => (<User key={user.id} user={user}/>))}
    </div>
  );
}

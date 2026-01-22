import { useState } from "react"
export const UserProfile =()=> {
const [user, setUser] = useState({
       name : "Bruce Wayne",
       age : 30,
       email: "batman@gmail.com",
       address : {
        city : "Gotham City",
        country : "the culprit"
       }
    })
const updateName=()=>{
    setUser({
        ...user,
        name : "Kevin"
    })
}
const updateAge=()=>{
    setUser({
        ...user,
        age:user.age + 1
    })
}
const updateNameAndAge =()=>{
    setUser({
        ...user,
        name: "Godfather",
        age : 100,
    })
}
const updateTheCity=()=>{
    setUser({
        ...user,
        address:{
            ...user.address,
            city : "Chattogram"
        }
    })
}
  return (
    <div>
      <h2>Name : {user.name}</h2>
      <p>Age : {user.age}</p>
      <p>Email : {user.email}</p>
      <p>City : {user.address.city}</p>
      <p>Coutry : {user.address.country}</p>
      <button onClick={updateName}>Change name to Kevin</button>
      <button onClick={updateAge}>Increase age by 1</button>
      <button onClick={updateNameAndAge}>Update Name And Age</button>
      <button onClick={updateTheCity}>update the city</button>
    </div>
  )
}

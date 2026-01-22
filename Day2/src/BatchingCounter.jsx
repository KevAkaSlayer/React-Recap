import { useState } from "react";

export const BatchingCounter=()=> {
    console.log("Simple counter component rendered")
    const [count, setCount] = useState(0);
    const [name, setName] = useState("")
    const [isActive, setIsAcive] = useState(false);

    const handlClick=()=>{
        setCount((prev)=> prev + 1)
        setCount((prev)=> prev + 5)
        setCount((prev)=> prev + 10)
        setName("Updated")
        setIsAcive(true)
    }
    return (
    <div>
        <h2>Count : {count}</h2>
        <p>Name : {name}</p>
        <p>Active : {isActive ? "Yes" : "No"}</p>
        <button onClick={handlClick}>Update All Three</button>
    </div>
    )
}

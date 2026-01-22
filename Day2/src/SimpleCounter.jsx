import { useState } from "react"

export const SimpleCounter=()=>{
  console.log("Simple counter component rendered")
  const [count, setCount] = useState(0);

  const handlClick=()=>{
    setCount(count + 1)
  }
  return (
    <div>
      <h2>Count : {count}</h2>
      <button onClick={handlClick}>Increment</button>
    </div>
  )
}

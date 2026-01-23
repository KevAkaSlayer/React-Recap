import { useReducer } from "react"

const initiaCount = 0


const reducer =(state,action)=>{
    switch(action) {
        case "increment" :
            return state + 1
        case "decrement" : 
            return state - 1
        case "reset" :
            return initiaCount
        default:
            return state;
    }
}

const init = (initialValue) =>{
    console.log("init function called - this only runs once!")

    const saveCount = localStorage.getItem("count")

    if(saveCount !== null) {
        console.log("Found saved count: ", saveCount);
        return parseInt(saveCount);
    }
    console.log("No Saved count, using initial value:", initialValue)
    return initialValue;

}

export const CounterWithInit =()=> {
const [count , dispatch] = useReducer(reducer,initiaCount,init) 
  return (
    <div>
      <p>Count :{count}</p>
      <button onClick={()=>dispatch("increment")}>Increment</button>
      <button onClick={()=>dispatch("decrement")}>Decrement</button>
      <button onClick={()=>dispatch("reset")}>Reset</button>
    </div>
  )
}

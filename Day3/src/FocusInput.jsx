import {useRef} from "react"

export const FocusInput=()=> {
    const inputRef = useRef(null);

    const handleInputFocus =()=>{
        inputRef.current.focus()
    }
  return (
    <div>
        <input ref = {inputRef} type="text" placeholder="Enter Your Name" />
      <button onClick={handleInputFocus}>Focus Input</button>
    </div>
  )
}

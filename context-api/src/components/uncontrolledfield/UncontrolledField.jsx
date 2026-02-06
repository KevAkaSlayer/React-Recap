import { useRef } from "react"


export default function UncontrolledField() {
  const emailRef = useRef('');

  const handleSubmit=(e)=>{
    e.preventDefault();
    console.log(emailRef.current.value);
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input ref={emailRef} type="email" name=""/>
        <br />
        <input type="password" name=""/>
        <br />
        <input type="submit" value="Submit" />
      </form>
    </div>
  )
}

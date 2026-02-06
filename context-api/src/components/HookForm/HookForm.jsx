import React from 'react'
import useInputField from '../../hooks/useinputField';

export default function HookForm() {
    const [name,nameOnChange] = useInputField('')
    const handleSubmit=(e)=>{
        e.preventDefault();
        console.log(name)
    }
  return (
    <div>
      <form onSubmit={handleSubmit}>
            <input defaultValue={name} type="text" onChange={nameOnChange}/>
            <br />
            <input type="submit" value="Submit"/>
      </form>
    </div>
  )
}

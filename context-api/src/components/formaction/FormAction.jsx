import React from 'react'

export default function FormAction() {

  const handleFormAction = (formData)=>{
    console.log(formData.get("name"));
  }
  return (
    <div>
      <form action={handleFormAction}>
        <input type="text" name = "name" placeholder='Name'/>
        <br />
        <input type="email" name = 'email' placeholder='Email'/>
        <br />
        <input type="submit" value="Submit"/>
      </form>
    </div>
  )
}

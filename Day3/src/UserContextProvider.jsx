import { UserContext } from './UserContext'
import { useState } from 'react'

export const UserContextProvider = ({children}) =>{
   const [user,setUser] = useState({
        name : "AMIN",
        role : "admin",
        theme : "dark"
    });
   return (
    <UserContext value = {{user, setUser}}>{children}</UserContext>
  )
}

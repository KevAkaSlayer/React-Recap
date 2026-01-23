import { createContext } from "react";



export const UserContext = createContext({
   user:{ name : "Guest",role : "vistor",theme :"Light"},
   setUser : () => {},
});
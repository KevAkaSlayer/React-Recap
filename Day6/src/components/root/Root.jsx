import Header from '../Header/Header'
import { Outlet } from 'react-router'

export default function Root() {
  return (
    <div>
      <Header/>
      <Outlet/>
    </div>
  )
}

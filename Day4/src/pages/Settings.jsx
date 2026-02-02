import { SideNav } from '../components/SideNav'
import { Box } from '@mui/material'
import Navbar from '../components/Navbar'

export default function Settings() {
  return (
    <>
        <Navbar></Navbar>
        <Box height={50}/>
    <Box sx={{ display: "flex" }}>
        <SideNav/>
        <h1>Settings</h1>
    </Box>
    </>
  )
}

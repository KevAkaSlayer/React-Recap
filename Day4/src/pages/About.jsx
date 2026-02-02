import { SideNav } from '../components/SideNav'
import { Box } from '@mui/material'
import Navbar from '../components/Navbar'

export default function About() {
  return (
    <>
    <Navbar></Navbar>
    <Box height={50}/>
    <Box sx={{ display: "flex" }}>
        <SideNav/>
        <h1>About</h1>
    </Box>
    </>
  )
}

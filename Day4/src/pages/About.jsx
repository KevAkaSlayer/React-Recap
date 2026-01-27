import { SideNav } from '../components/SideNav'
import { Box } from '@mui/material'


export default function About() {
  return (
    <>
    <Box sx={{ display: "flex" }}>
        <SideNav/>
        <h1>About</h1>
    </Box>
    </>
  )
}

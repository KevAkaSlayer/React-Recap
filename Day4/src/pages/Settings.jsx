import { SideNav } from '../components/SideNav'
import { Box } from '@mui/material'


export default function Settings() {
  return (
    <>
    <Box sx={{ display: "flex" }}>
        <SideNav/>
        <h1>Settings</h1>
    </Box>
    </>
  )
}

import {Stack , TextField,InputAdornment} from "@mui/material"

export default function MuiTextField() {
  return (
    <Stack spacing={4}> 
        <Stack direction='row' spacing = {2}>
            <TextField label = 'Name' variant="outlined"></TextField>
            <TextField label = 'Name' variant="filled"></TextField>
            <TextField label = 'Name' variant="standard"></TextField>
        </Stack>
        <Stack direction='row' spacing={2}>
            <TextField label = 'Small secondary' size = 'small' color = 'secondary'/>
        </Stack>
        <Stack direction='row' spacing={2}>
            <TextField label = 'Form Input' required/>
            <TextField label = 'password' type="password" helperText = 'Do not share your password with anyone'/>
            <TextField label = 'Read Only' InputProps={{readOnly : true}} required/>
        </Stack>
        <Stack direction='row' spacing={2}>
            <TextField label = 'Amount' InputProps={{startAdornment : <InputAdornment position="start">$</InputAdornment>}}/>

            <TextField label = 'Weight' InputProps={{endAdornment : <InputAdornment position="end">kg</InputAdornment>}} />
        </Stack>
    </Stack>
  )
}

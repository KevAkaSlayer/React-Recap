import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

export default function SearchBox({ allAccount }) {
  console.log(allAccount);
  return (
    <Autocomplete
      disablePortal
      options={allAccount.map((account) => ({
        label: account.Account_Name,
        key: account.id,
      }))}
      getOptionLabel={(option) => option.label}
      sx={{ width: 300 }}
      renderInput={(params) => <TextField {...params} label="Accounts" />}
    />
  );
}

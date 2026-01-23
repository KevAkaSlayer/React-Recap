import "./App.css";
import { Header } from "./Header";
import { UserContextProvider } from "./UserContextProvider";
import { StopWatch } from "./StopWatch";
import { FocusInput } from "./FocusInput";
function App() {
  return (
    // <UserContextProvider>
    //   <div>
    //     <h1>Dashboard</h1>
    //     <Header />
    //   </div>
    // </UserContextProvider>
    <>
    <h1>Hello</h1>
    {/* <StopWatch/> */}
    <FocusInput/>
    </>
  );
}

export default App;

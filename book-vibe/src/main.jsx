import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { RouterProvider } from "react-router/dom";
import router from './Routes/Routes.jsx';
import { ToastContainer } from 'react-toastify';


createRoot(document.getElementById('root')).render(
  <RouterProvider router={router}>
    <App/>
    <ToastContainer />
  </RouterProvider>
)

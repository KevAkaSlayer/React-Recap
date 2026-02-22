import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import CreateRecord from './CreateRecord.jsx';


const router = createBrowserRouter([
  {
    path: "/",
    element: <App></App>,
  },
  {
    path : "/create-record",
    Component : CreateRecord
  }
]);

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} >,
    <App />
  </RouterProvider>
)

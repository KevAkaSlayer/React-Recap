import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import Roots from './layouts/Roots.jsx';
import Home from './components/Home/Home.jsx';
import Login from './components/Login/Login.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    Component : Roots,
    children:[
      {
        index:true,
        Component : Home
      },
      {
        path : 'login',
        Component : Login
      }
    ]
  },
]);

createRoot(document.getElementById('root')).render(
   <RouterProvider router={router} >
    <App/>
  </RouterProvider>
)

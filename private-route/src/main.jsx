import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import Root from './layouts/Root.jsx';
import Error from './components/Error.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    Component : Root,
    errorElement: <Error></Error>,
    children : [
      {
        index : true,
        path : "/",
        Component : Home
      },
      {
        path : "/login",
        Component:Login
      },
      {
        path : "/register",
        Component : Register
      }
    ]
  },
]);


createRoot(document.getElementById('root')).render(
  <RouterProvider router={router}>
    <App />
  </RouterProvider>
)

import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import Root from './root/Root.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Blog from './pages/Blog.jsx';
import Recipes from './components/Recipes.jsx';
import Account from './pages/Account.jsx';
import Profile from './pages/Profile.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';


const router = createBrowserRouter([
  {
    path: "/",
    Component:Root,
    children : [
      {
        path : "/",
        Component:Home
      },
      {
        path : "/about",
        Component : About
      },
      {
        path : "/blog",
        Component : Blog
      },
      {
        path: "/recipes",
        loader : ()=>fetch("https://dummyjson.com/recipes"),
        Component: Recipes
      },
      {
        path:"/account",
        Component:Account
      },
      {
        path : "/profile",
        Component:Profile
      },
      {
        path:"/dashboard",
        Component:Dashboard
      },
      {
        path:"/login",
        Component:Login
      }
    ]
  },
]);

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router}>
    <App />
  </RouterProvider>
)

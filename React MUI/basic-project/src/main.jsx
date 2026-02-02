import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import Root from './root/Root.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Blog from './pages/Blog.jsx';


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
      } 
    ]
  },
]);

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router}>
    <App />
  </RouterProvider>
)

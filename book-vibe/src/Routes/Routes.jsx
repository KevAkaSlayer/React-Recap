import { createBrowserRouter } from "react-router";
import Root from "../Root/Root";
import Home from "../pages/Home";
import Error from "../pages/ErrorPage/Error";
import Books from "../pages/Books/Books";
import BookDetails from "../pages/BookDetails/BookDetails";
import About from "../pages/About/About";
import ReadList from "../pages/ReadList/ReadList";
import Notes from "../pages/Notes/Notes";
import Login from "../pages/Login/Login";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    errorElement: <Error></Error>,
    children: [
      {
        index: true,
        path: "/",
        loader: () => fetch("/BooksData.json"),
        Component: Home,
      },
      {
        path: "/about",
        Component: About,
      },
      {
        path: "/readlist",
        loader: () => fetch("/BooksData.json"),
        Component: ReadList,
      },
      {
        path: "/books",
        Component: Books,
      },
      {
        path: "/book/:id",
        loader: () => fetch("/BooksData.json"),
        Component: BookDetails,
      },
      {
        path: "/notes",
        Component: Notes,
      },
      {
        path: "/login",
        Component:Login
      }
    ],
  },
]);

export default router;

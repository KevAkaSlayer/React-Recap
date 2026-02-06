import React from "react";
import { Outlet } from "react-router";
import Navbar from "../components/Header/Navbar";
import Footer from "../components/Header/Footer/Footer";
export default function Root() {
  return (
    <div className="max-w-6xl mx-auto">
      <Navbar></Navbar>
      <Outlet />
      <Footer></Footer>
    </div>
  );
}

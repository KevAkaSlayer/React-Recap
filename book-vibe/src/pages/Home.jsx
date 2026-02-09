import React from "react";
import { Helmet } from "react-helmet-async";
import Banner from "../components/Banner/Banner";
import Books from "./Books/Books";
import { useLoaderData } from "react-router";

export default function Home() {
  const books = useLoaderData();
  return (
    <>
      <Helmet>
        <title>Home | Book Vibe</title>
      </Helmet>
      <div>
        <Banner />
        <Books books={books} showHelmet={false} />
      </div>
    </>
  );
}

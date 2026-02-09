import React from "react";
import { Helmet } from "react-helmet-async";

export default function Error() {
  return (
    <div>
      <Helmet>
        <title>404 | Book Vibe</title>
      </Helmet>
      <h1 className="flex justify-center items-center">404 Not Found</h1>
    </div>
  );
}

import React from "react";
import book from "../../assets/books.jpg";

export default function Banner() {
  return (
    <div>
      <div
        className="hero "
        style={{
          backgroundImage: `url(${book})`,
        }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-content text-neutral-content text-center">
          <div className="max-w-md">
            <h1 className="mb-5 text-5xl font-bold">Today a reader, Tomorrow a leader.</h1>
            <p className="mb-5">
              "A reader lives a thousand lives before he dies. The man who never reads lives only one." – George Martin
            </p>
            <button className="btn btn-primary">Get Started</button>
          </div>
        </div>
      </div>
    </div>
  );
}

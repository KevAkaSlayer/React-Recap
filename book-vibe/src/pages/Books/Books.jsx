import Book from "../Book/Book";
import { useState } from "react";
import { Helmet } from "react-helmet-async";

export default function Books({ books, showHelmet = true }) {
  const [sortedBooks, setSortedBooks] = useState([]);
  const handleSort = () => {
    const sortedList = [...books].sort((a, b) => a.pages - b.pages);
    setSortedBooks(sortedList);
  };

  return (
    <div className="flex flex-col justify-center items-center m-5">
      {showHelmet && (
        <Helmet>
          <title>Books | Book Vibe</title>
        </Helmet>
      )}
      <p className="text-2xl text-center mb-2">Available Books</p>
      <div className="flex justify-start w-full mb-5">
        <button onClick={handleSort} className="btn btn-primary mb-5">
          Sort
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sortedBooks.length > 0
          ? sortedBooks.map((book) => (
              <Book key={book.isbn_13} book={book}></Book>
            ))
          : books.map((book) => <Book key={book.isbn_13} book={book}></Book>)}
      </div>
    </div>
  );
}

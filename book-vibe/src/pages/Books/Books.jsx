import { useLoaderData } from 'react-router'
import Book from '../Book/Book'

export default function Books({books}) {
  return (
    <div className='flex flex-col justify-center items-center m-5'>
      <p className='text-2xl text-center mb-2'>Available Books</p>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {
          books.map(book => <Book key={book.isbn_13} book={book}/>)
        }
      </div>
    </div>
  )
}

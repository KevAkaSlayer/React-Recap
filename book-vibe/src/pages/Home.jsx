import React from 'react'
import Banner from '../components/Banner/Banner'
import Books from './Books/Books'
import { useLoaderData } from 'react-router'

export default function Home() {
    const books = useLoaderData()
  return (
    <div>
      <Banner/>
      <Books books={books}/>
    </div>
  )
}

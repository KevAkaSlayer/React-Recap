import { Suspense } from 'react';
import './App.css'
import Users from './Users'
import Friends from './Friends';
import Posts from './Posts';
import Countries from './Countries';

const countriesPromise = fetch('https://restcountries.com/v3.1/all?fields=name,flags,cca2')
  .then(res => res.json())


const fetchUsers = fetch('https://jsonplaceholder.typicode.com/users')
  .then(res => res.json())

const fetchFriends = async()=>{
  const res = await fetch('https://jsonplaceholder.typicode.com/users')
  return res.json()
}

const fetchPosts = fetch('https://jsonplaceholder.typicode.com/posts')
  .then(res=>res.json())
function App() {

  const friendPromise = fetchFriends();
  return (
    <>
    {/* <Suspense fallback={<h3>Loading Users...</h3>}>
      <Users fetchUsers={fetchUsers}/>
    </Suspense> */}
    {/* <Suspense fallback={<h3>Loading Friends...</h3>}>
      <Friends friendPromise={friendPromise}/>
    </Suspense> */}

    {/* <Suspense fallback = {<h3>Loading Users....</h3>}> 
      <Posts fetchPosts={fetchPosts}/>
    </Suspense>  */}
    {
      <Suspense fallback= {<h3>Loading Countries....</h3>}>
        <Countries countriesPromise={countriesPromise}/>
      </Suspense>
    }
    </>
  )
}

export default App

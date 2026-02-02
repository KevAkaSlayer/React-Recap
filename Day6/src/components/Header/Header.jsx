import React from 'react'
import { Link } from 'react-router'

export default function Header() {
  return (
    <div >
        <h3>This is header</h3>
        <div >
            <Link to="/">Home</Link>
            <Link to="/mobiles">mobiles</Link>
            <Link to="/laptops">laptops</Link>
            <Link to="#"></Link>
            <Link to = "/users">Users</Link>
        </div>
    </div>
  )
}

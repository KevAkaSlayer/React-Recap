import { Link } from 'react-router'
import { use, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';

export default function Register() {
 ZOHO.CRM.API.getAllRecords({Entity:"Leads",sort_order:"asc",per_page:2,page:1})
  .then(function(data){
    console.log(data) 
  })

    


    const handleRegister = e =>{
        e.preventDefault();
        const name = e.target.name.value; 
        const designation = e.target.designation.value; 
        const email = e.target.email.value; 
        const password = e.target.password.value;
    }
  return (
    <div className="flex justify-center items-center mt-10">
      <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-2xl">
        <div className="card-body">
          <form onSubmit={handleRegister} className="fieldset">
            <label className="label">Name</label>
            <input type="text" className="input" name = "name" placeholder="Name" />
            <label className="label">Designation</label>
            <input type="text" className="input" name = "designation" placeholder="Designation" />
            <label className="label">Email</label>
            <input type="email" className="input" name = "email" placeholder="Email" />
            <label className="label">Password</label>
            <input type="password" className="input" name = "password" placeholder="Password" />
            <button className="btn btn-neutral mt-4">Register</button>
          </form>
          <p>Already registered? Please <Link to="/login">login</Link></p>
        </div>
      </div>
      <div>

      </div>
    </div>
  )
}

import React from 'react'
import { useState } from 'react';
export default function ProductForm({handleAddProduct}) {
    const [error, setError] = useState('')
  const handleProductSubmit =(e)=>{
    e.preventDefault();
    const name = e.target.name.value;
    const price = e.target.price.value;
    const quantity = e.target.quantity.value;
    if(name.length === 0){
        return setError('Please provide e product name ')
    }else if(price.length === 0){
        return setError('Please provide a price')
    }else if (price < 0){
        return setError('price cannot be negative')
    }else {
        setError('');
    }

    const newProduct = {
        name, 
        price,
        quantity
    }
    handleAddProduct(newProduct)
  }


  return (
    <div>
       <h3>Add a Product</h3>
      <form onSubmit={handleProductSubmit}>
        <input type="text" name = 'name' placeholder='Product Name'/>
        <br />
        <input type="text" name = 'price' placeholder='Product Price'/>
        <br />
        <input type="text" name = 'quantity' placeholder='Product Quantity'/>
        <br />
        <input type="submit" value="Submit"/>
      </form>
      <p style={{color : 'red'}}><small>{error}</small></p>
    </div>
  )
}

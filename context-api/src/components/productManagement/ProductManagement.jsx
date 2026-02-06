import React, { useState } from 'react'
import ProductForm from './ProductForm'
import ProductTable from './ProductTable'

export default function ProductManagement() {

  const [products, setProducts] = useState([])  

  const handleAddProduct = newProduct =>{
     const newProducts = [...products,newProduct]
     setProducts(newProducts)
  }
  return (
    <div>
      <ProductForm handleAddProduct = {handleAddProduct}/>
      <ProductTable products={products}/>
    </div>
  )
}

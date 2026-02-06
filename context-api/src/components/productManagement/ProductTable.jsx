import React from 'react'

export default function ProductTable({products}) {
  return (
    <div>
      <h3>products : {products.length}</h3>
      <table border="2">
        <thead>
            <tr>
                <th>No</th>
                <th>Product Name</th>
                <th>Product Price</th>
                <th>Product Quantity</th>
            </tr>
        </thead>
        <tbody>
            {
                products.map((product,index) =>
                <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{product.name}</td>
                    <td>{product.price}</td>
                    <td>{product.quantity}</td>
                </tr>
            )}
        </tbody>
      </table>
    </div>
  )
}

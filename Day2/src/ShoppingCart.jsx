import { useState } from "react"

export const ShoppingCart=()=>{
  const [cartItems,setCartItems] = useState({
    reactCourse: 0,
    vueCourse : 0
  });

  const prices = {
    reactCourse : 49.99,
    vueCourse : 49.99
  }

  const handleAddReactCourse =()=>{
    if(cartItems.reactCourse < 5){
      setCartItems({
        ...cartItems,
        reactCourse : cartItems.reactCourse + 1
      })
    }
  }
 const handleAddVueCourse =()=>{
    setCartItems({
      ...cartItems,
      vueCourse : cartItems.vueCourse + 1
    })
  }
  const clearCart=()=>{
    setCartItems({
      reactCourse : 0,
      vueCourse : 0
    })
  }

  return(
    <>
      <h2>Shopping Cart</h2>
      <ProductCard name = "React course" price = {prices.reactCourse} quantity = {cartItems.reactCourse} onAddToCart={handleAddReactCourse}/>
      <ProductCard name = "Vue course" price = {prices.vueCourse} quantity = {cartItems.vueCourse} onAddToCart={handleAddVueCourse}/>
      <CartSummery cartItems={cartItems} prices={prices}/>
      <button onClick={clearCart}>clear cart</button>
    </>
  )
}


export const ProductCard=({name , price, quantity, onAddToCart})=> {
  
  return (
    <div>
      <h3>{name}</h3>
      <p>${price}</p>
      <p>Quantity : {quantity}</p>
      <button onClick={onAddToCart}>Add to Cart</button>
    </div>
  )
}

export const CartSummery=({cartItems,prices})=>{
  const totalItems = cartItems.reactCourse + cartItems.vueCourse
  const totalPrice = cartItems.reactCourse * prices.reactCourse + cartItems.vueCourse * prices.vueCourse
  return (
    <>
      <h3>Cart Summary</h3>
      <p>Total Items : {totalItems}</p>
      <p>Total Price : ${totalPrice.toFixed(2)}</p>
    </>
  )
}

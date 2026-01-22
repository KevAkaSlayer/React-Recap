import { useReducer } from "react";

const initialState = {
  items: [], // {id,name, price , quantity}
  totalAmount: 0,
  totalItems: 0,
};
const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === action.payload.id,
      );
      let updatedItems;
      if (existingItemIndex >= 0) {
        updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex.quantity] + 1,
        };
      } else {
        updatedItems = [...state.items, { ...action.payload, quantity: 1 }];
      }
      return {
        ...state,
        items: updatedItems,
        totalAmount: updatedItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        ),
        totalItems: updatedItems.reduce(
          (total, item) => total + item.quantity,
          0,
        ),
      };
    }
    default:
      return state;
  }
};

export const ShoppingCartWithReducer = () => {
  useReducer(reducer, initialState);
  const products = [
    { id: 1, name: "Learn React", price: 49.99 },
    { id: 2, name: "Learn JS", price: 39.99 },
    { id: 3, name: "Learn Programing", price: 59.99 },
  ];

  return (
    <div>
      <h2>Products</h2>
      {products.map((product) => {
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>price : ${product.price}</p>
          <button
            onClick={() =>
              dispatch({
                type: "ADD_ITEM",
                payload: product,
              })
            }
          >
            Add to Cart
          </button>
        </div>;
      })}
      <div>
        <h2>Shopping Cart</h2>
        {state.items.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          <div>
            {state.items.map((item) => {
              <div key={item.id}>
                <p>
                  {" "}
                  {item.name} - ${item.price} x {item.quantity}
                </p>
              </div>;
            })}
            <h3>Total Items : {state.totalItems}</h3>
            <h3>Total amount : {state.totalAmount.toFixed(2)}</h3>
          </div>
        )}
      </div>
    </div>
  );
};

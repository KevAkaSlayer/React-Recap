import { useState } from "react";

export const Counter = () => {
  const [count, setCount] = useState(0);
  const handleClick = () => {
    setCount(count + 1);
    console.log(count);
  };
  return <button onClick={handleClick}>Count : {count}</button>;
};

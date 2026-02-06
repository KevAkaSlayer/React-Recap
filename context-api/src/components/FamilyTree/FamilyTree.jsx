import React, { createContext, useState } from "react";
import Grandpa from "./Grandpa";
import "./FamilyTree.css";


export const AssetContext = createContext('')
export const MoneyContext = createContext(0)

export default function FamilyTree() {
  const [money , setMoney] = useState(0);
  const asset = 'diamond';
  const newAsset = 'Gold'
  return (
    <div className="family-tree">
      <h1>Family Tree</h1>
      <MoneyContext.Provider value='100000'>
        <AssetContext.Provider value={newAsset}>
        <Grandpa asset={asset}/>
      </AssetContext.Provider>
      </MoneyContext.Provider>
    </div>
  );
}

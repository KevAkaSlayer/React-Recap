import React, { useContext } from 'react'
import { AssetContext } from './FamilyTree'

export default function Special({name,asset}) {
  const newAsset = useContext(AssetContext);
  console.log('new asset',newAsset)
  return (
    <div>
      <h3>{name}</h3>
      <p>Asset : {newAsset}</p>
    </div>
  )
}

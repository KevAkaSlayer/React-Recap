import React, { use } from 'react'
import { MoneyContext } from './FamilyTree'

export default function Cousin({name}) {
    const money = use(MoneyContext)
  return (
    <div>
      <h3>{name}</h3>
      {
        name === 'labia' && <p>I have {money}</p>
      }
    </div>
  )
}

import React from 'react'
import Cousin from './Cousin'

export default function Uncle() {
  return (
    <div>
      <h1>Uncle</h1>
      <section className='flex'>
        <Cousin name='Rakib'/>
        <Cousin name='Sakib'/>
      </section>
    </div>
  )
}

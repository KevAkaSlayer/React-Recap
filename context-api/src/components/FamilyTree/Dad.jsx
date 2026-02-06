import React from 'react'
import Myself from './Myself'
import Brother from './Brother'
import Sister from './Sister'

export default function Dad() {
  return (
    <div>
      <h1>Dad</h1>
      <section className='flex'>
        <Myself></Myself>
        <Brother></Brother>
        <Sister></Sister>
      </section>
    </div>
  )
}

import React from 'react'

export default function Friend({friend}) {
  return (
    <div>
      <h4> Name : {friend.name}</h4>
      <h4> Email : {friend.email}</h4>
      <hr />
    </div>
  )
}

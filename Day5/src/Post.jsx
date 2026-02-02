import React from 'react'

export default function Post({post}) {
  return (
    <div>
      <h1>post {post.id}</h1>
      <h4>{post.title}</h4>
      <p>{post.body}</p>
      <hr />
    </div>
  )
}

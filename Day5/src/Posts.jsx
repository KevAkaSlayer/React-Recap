import { use } from "react"
import Post from "./Post"

export default function Posts({fetchPosts}) {
  const posts = use(fetchPosts)
  console.log(posts)
  return (
    <div>
      <h1>Posts : {posts.length}</h1>
      {
        posts.map(post => <Post key ={post.id} post={post}></Post> )
      
      }
    </div>
  )
}

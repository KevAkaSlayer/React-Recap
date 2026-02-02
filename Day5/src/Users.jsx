import { use } from "react"

export default function Users({ fetchUsers }) {
const users = use(fetchUsers)
console.log(users)
  return (
    <div>
      <h1>Users : {users.length}</h1>
      {
        users.map(user => (
          <div key={user.id}>
            <h2>{user.name}</h2>
            <p>{user.email}</p>
          </div>
        ))
      }
    </div>
  )
}

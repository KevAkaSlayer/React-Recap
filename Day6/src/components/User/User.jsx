export default function User({ user }) {
    return(
        <div style={{border: "2px solid black", margin: "10px", padding: "10px"}}>
            <h3>Name: {user.name}</h3>
            <p>Username: {user.username}</p>
            <p>Email: {user.email}</p>
            <p>Phone: {user.phone}</p>
            <p>Website: {user.website}</p>
        </div>
    )
}

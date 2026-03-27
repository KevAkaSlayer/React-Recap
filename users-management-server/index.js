const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("users server is running");
});

const users = [
  { id: 1, name: "kev", email: "kev@gmail.com" },
  { id: 2, name: "habil", email: "habil@gmail.com" },
  { id: 3, name: "kabil", email: "kabil@gmail.com" },
  { id: 4, name: "rabil", email: "rabil@gmail.com" },
];

app.get("/users", (req, res) => {
  res.send(users);
});

app.post("/users", (req, res) => {
  console.log("users post req");
  const newUser = req.body;
  newUser.id = users.length + 1;
  users.push(newUser);
  res.send(newUser);
});

app.listen(port, () => {
  console.log(`Users Server running on port ${port}`);
});

const { pool } = require("./database");

async function registerUser(username, email, password) {
  const query = "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)";
  await pool.query(query, [username, email, password]);
}

async function loginUser(username, password) {
  const query = "SELECT * FROM users WHERE username = $1 AND password = $2";
  const result = await pool.query(query, [username, password]);
  if (result.rows.length > 0) {
    return true;
  } else {
    throw new Error("Usuario o contraseña incorrectos");
  }
}

module.exports = { registerUser, loginUser };

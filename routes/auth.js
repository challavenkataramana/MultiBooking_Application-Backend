const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
require("dotenv").config();

const router = express.Router();
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).send({ error: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "insert into users(name,email,password) values($1,$2,$3) returning *",
      [name, email, hashedPassword]
    );

    res
      .status(201)
      .send({ message: "User registered successfully", user: result.rows[0] });
  } catch (err) {
    console.error("Registration Error:", err);
    res
      .status(400)
      .send({ error: "User registration failed", details: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email,password);
  try {
    const result = await pool.query("select * from users where email=$1", [
      email,
    ]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).send({ error: "Invalid Credentials" });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(200).send({ message: "Login successful", token });
  } catch (err) {
    res.status(500).send({ error: "Login Failed" });
  }
});

router.post("/google-login", async (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: "Email and name are required" });
  }

  try {
    const userQuery = "SELECT id FROM users WHERE email = $1";
    const userResult = await pool.query(userQuery, [email]);

    let userId;

    if (userResult.rows.length > 0) {
      userId = userResult.rows[0].id;
    } else {
      const insertQuery = `
         INSERT INTO users (email, name) 
         VALUES ($1, $2) 
         RETURNING id
       `;
      const insertResult = await pool.query(insertQuery, [email, name]);
      userId = insertResult.rows[0].id;
    }

    const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token });
  } catch (error) {
    console.error("Error during Google login/registration:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const userResult = await pool.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [userId]
    );
    const user = userResult.rows[0];
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

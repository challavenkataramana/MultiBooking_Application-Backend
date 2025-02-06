const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");
require("dotenv").config();

const app = express();
const cors = require("cors");

const corsOptions = {
  origin: [
    "http://localhost:3001",
    "http://localhost:3000",
    "https://multibooking-application-5b14.vercel.app",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.removeHeader("Cross-Origin-Embedder-Policy"); 
  next();
});


app.use(express.static("public"));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Welcome to the MultiBooking API!');
});

app.use("/auth", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
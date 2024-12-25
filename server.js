const cors = require('cors');
const express=require('express');
const bodyParser=require('body-parser');
const authRoutes=require('./routes/auth');


require('dotenv').config();


const app=express();

app.use(cors({
  origin: 'http://localhost:3001', // Your frontend URL
  methods: ['GET', 'POST'],
  credentials: true // Allow cookies or credentials if needed
}));



app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin"); // Same-origin policy for opener
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp"); // Require embedded content to come from a trusted origin
  next();
});


app.use(express.static('public'));

app.use(bodyParser.json());
app.use('/auth',authRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
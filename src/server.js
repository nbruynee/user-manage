require('dotenv').config();

const express = require('express');
const authRoute = require('./routes/auth');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser')

const app = express()
const port = process.env.PORT || 8088;
const hostname = process.env.HOST_NAME;

mongoose.connect(process.env.DB_URL)
  .then(() => {
    console.log('MongoDB connected successfully!');
  })
  .catch(err => {
    console.error('Error connect to MongoDB:', err);
  });

app.use(express.json());
app.use(cookieParser());

app.use('/v1/auth', authRoute);

app.listen(port, hostname, () => {
  console.log(`Server is running on port ${port}`)
    console.log(`You can access at: http://localhost:${port}`)
  })
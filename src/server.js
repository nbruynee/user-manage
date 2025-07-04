require('dotenv').config();

const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const app = express();
const port = process.env.PORT || 8088;
const hostname = process.env.HOST_NAME; 

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, hostname, () => {
    console.log(`Server is running on port ${port}`)
    console.log(`You can access at: http://${hostname}:${port}`)
})
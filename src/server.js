require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser')
const authRoute = require('./routes/auth');
const userRoute = require('./routes/user')
const { initMockData } = require('./data/mockData')

const app = express()
const port = process.env.PORT || 8088;

app.use(express.json());
app.use(cookieParser());

app.use('/v1/auth', authRoute);
app.use('/v1/users', userRoute);

initMockData()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`)
      console.log(`You can access at: http://localhost:${port}`)
    });
  })
  .catch(err => {
    console.log("Failed to initialize mock data!", err);
    process.exit(1);
  });
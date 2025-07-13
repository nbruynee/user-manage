require('dotenv').config();
const express = require('express');
const notifRoute = require('./routes/notification')

const app = express();
const port = process.env.PORT || 8082;

app.use(express.json());
app.use('/', notifRoute);

app.listen(port, () => {
    console.log(`Notification Service running on port ${port}`);
    console.log(`Access it at: http://localhost:${port}`);
})


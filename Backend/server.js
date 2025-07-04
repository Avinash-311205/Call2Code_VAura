const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const narrateRoute = require('./routes/narrate');
app.use('/api/narrate', narrateRoute);

app.listen(5000, () => {
    console.log('Backend running on https://localhost:5000')
});

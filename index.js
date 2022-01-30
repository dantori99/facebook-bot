require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const port = process.env.PORT || 1337;
const webhook = require('./routes/webhook')

const app = express();

const corsOptions = {
  origin: "*",
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Content-Length",
    "X-Requested-With",
    "Accept",
  ],
  methods: ["GET", "POST"],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const server = http.createServer(app);

app.use(webhook);

app.use(cors(corsOptions));

server.listen(port, () => console.log(`webhook is listening on port ${port}!`))
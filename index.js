require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 1337;
const webhook = require('./routes/webhook')

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

app.use(webhook);

app.use(cors(corsOptions));

server.listen(port, () => console.log(`webhook is listening on port ${port}!`))
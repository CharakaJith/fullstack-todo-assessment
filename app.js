const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();
const { CORS } = require('./common/messages');

const ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 3000;

// initialize the express app
const app = express();
app.use(express.json({ limit: '10kb' }));

// initialize cors
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:5173'];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error(CORS.INVALID));
      }
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Access-Token'],
  })
);

// global custom error handler
app.use(errorHandler);

// start the server
app.listen(PORT, () => {
  console.log(`${ENV} | ${PORT}`);
});

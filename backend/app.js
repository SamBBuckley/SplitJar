const express = require('express');

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', "*");
  res.setHeader('Access-Control-Allow-Headers',
  'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods',
  'GeT, POST, PATCH, DELETE, OPTIONS');
  next();
});

app.use((req, res, next) => {
  console.log('Access to the backend was made.');
  res.status(200).json({message: 'Successfule query of backend made.'});
});


module.exports = app;

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const User = require('./models/user');
// const Jar = require('./models/jar');

const app = express();

mongoose.connect("mongodb+srv://sam:l6VkDK7YjNsxN4pm@cluster0-mgj46.mongodb.net/splitjar?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {
  console.log('Connected to database!');
})
.catch(() => {
  console.log('Connection failed!');
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


//Default path for all traffic
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', "*");
  res.setHeader('Access-Control-Allow-Headers',
  'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods',
  'GeT, POST, PATCH, DELETE, OPTIONS');
  next();
});

// Rest Get requests

//Users
app.get('/api/v1/users', (req, res, next) => {
  User.find()
  .then(users => {
    res.status(200).json( {
      message: "Returned all stored Users",
      users: users
    });
  });
});

app.get('/api/v1/users/:email', (req, res, next) => {
  User.findOne( {email: req.params.email })
  .then(results => {
    if (results === null) {
      res.status(200).json( {message: "User email does not exist."});
    } else {
      res.status(200).json( {message: "User found", user: results });
    }
  });
});

app.get('/api/v1/users/id/:id', (req, res, next) => {
  User.findOne( { _id: req.params.id })
  .then(results => {
    if (results === null) {
      res.status(200).json( {message: "User email does not exist."});
    } else {
      res.status(200).json( {message: "User found", user: results });
    }
  })
});

//Rest Post requests

//Users
app.post('/api/v1/adduser', (req, res, next) => {
  const user = new User({
    email: req.body.email,
    name: req.body.name,
    password: req.body.password,
    balance: req.body.balance
  });

  user.save().then(createdUser => {
    res.status(200).json( {
      message: "Added User to database",
      userId: createdUser._id
    });
  });
});




// //Standard Responses
app.use('/ping', (req, res, next) => {
  res.status(200).json('Pong!');
});

app.use((req, res, next) => {
  res.status(200).json( {message: 'You have succesfully reached the / of the splitJar Backend', time: new Date().toJSON()} )
});


module.exports = app;

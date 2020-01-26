const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const User = require('./models/user');
const Jar = require('./models/jar');

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

//GENERIC

app.get('/api/v1/exchange/user/:userID/jar/:jarID/amount/:amount', (req, res, next) => {
  User.findOne( {id: req.params.userID} )
  .then(foundUser => {
    if(foundUser === null) {
      res.status(404).json({message: 'An account with that id does not exist'});
    } else {
      foundUser.balance = foundUser.balance - req.params.amount;
      foundUser.save().then(userResult => {
        Jar.find({_id: req.params.jarID}).then(foundJar => {
          if(foundJar == null) {
            res.status(404).json({
              message: "No jar with that Id exists"
            });
          } else {
            foundJar.forEach(jar => {
              jar.balance = jar.balance + req.params.amount;
              jar.save().then(jarResult => {
                res.status(201).json({message: 'Succesfully set the balance of the user and jar', user: userResult, jar: jarResult});
              })
            });
          }
        });

      });
    }
  });
});

//Users
//Posts
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

app.post('/api/v1/users/validate', (req, res, next) => {
  const email = req.body.username;
  const password = req.body.password;

  User.findOne( { email, password })
  .then(results => {
    if (results === null) {
      res.status(200).json( {message: "Bad username and password pair"});
    } else {
      res.status(200).json( {message: "User found", user: results });
    }
  });
});

app.get('/api/v1/users/validate/username/:userID/password/:userPass', (req, res, next) => {
  const email = req.params.userID;
  const password = req.params.userPass;
  User.findOne( { email, password })
  .then(results => {
    if (results === null) {
      res.status(200).json( {message: "Bad username and password pair"});
    } else {
      res.status(200).json( {message: "User found", user: results });
    }
  });
});

//Puts

app.put('/api/v1/users/updateBalance/:userID/amount/:amount', (req, res, next) => {
  User.findOne( {id: req.body.userID})
  .then(foundUser => {
    if(foundUser === null) {
      res.status(404).json({message: 'An account with that id does not exist'});
    } else {
      foundUser.balance = req.body.amount;
      foundUser.save().then(result => {
        res.status(200).json({message: 'successfully set the users balance.', user: result});
      });
    }
  });
});

//Gets
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

//Jars

//Posts
app.post('/api/v1/jars/addJar', (req, res, next) => {
  const jar = new Jar({
    title: req.body.title,
    description: req.body.description,
    balance: req.body.balance,
    charge: req.body.charge,
    goal: req.body.goal,
    users: req.body.users
  });

  jar.save().then(createdJar => {
    res.status(200).json( {
      message: "Added Jar to database",
      jarId: createdJar._id
    });
  });
});

//Puts
/*
For some reason <moduleName>.update() does not work at all. Having to use this method instead.
*/
app.put('/api/v1/jars/updateJar/:jarID', (req, res, next) => {
  const reqId = req.params.jarID;
  // Get this jad and it's data, then delete it from the database. Then create a new one with the new data.
  const newJar = new Jar({
    _id: req.params.jarID,
    title: req.body.title,
    description: req.body.description,
    balance: req.body.balance,
    charge: req.body.charge,
    goal: req.body.goal,
    users: req.body.users
  });
  //Deleting
  newJar.deleteOne({_id: reqId}).then(deletedJar => {
    //Recreate the object with the new data
    newJar.save().then(createdJar => {
      res.status(201).json( {
        message: "Index Recreated",
        deleted: deletedJar,
        created: createdJar
      });
    });
  });
});

app.put('/api/v1/jars/updateBalance/:jarID/amount/:newBalance', (req, res, next) => {
  Jar.find({_id: req.params.jarID}).then(foundJar => {
    if(foundJar == null) {
      res.status(404).json({
        message: "No jar with that Id exists"
      });
    } else {
      foundJar.forEach(jar => {
        jar.balance = req.params.newBalance;
        jar.save().then(result => {
          res.status(201).json({message: 'Succesfully set the balance of the jar', jar: result});
        })
      });
    }
  });
});

app.put('/api/v1/jars/addUser/:jarID/username/:userID', (req, res, next) => {
  Jar.find({_id: req.params.jarID}).then(foundJars => {
    if(foundJars.length == 0) {
      res.status(404).json({
        message: "No jar with that Id exists"
      });
    } else {
      foundJars.forEach(jar => {
        jar.users.push(req.params.userID);
        jar.save().then(result => {
          res.status(201).json({message: 'Succesfully added the id to the jar', jar: result});
        })
      });
    }
  });
});

app.put('/api/v1/jars/updateCharge/:jarID/amount/:chargeAmount', (req, res, next) => {
  Jar.find({_id: req.params.jarID}).then(foundJars => {
    if(foundJars.length == 0) {
      res.status(404).json({
        message: "No jar with that Id exists"
      });
    } else {
      foundJars.forEach(jar => {
        jar.charge = req.params.chargeAmount;
        jar.save().then(result => {
          res.status(201).json({message: 'Succesfully updated the charge amount for the jar', jar: result});
        })
      });
    }
  });
});

//Gets
app.get('/api/v1/jars', (req, res, next) => {
  Jar.find().then(results => {
    res.status(200).json( {
      message: "Gathered All Jars succesfully",
      jars: results
    });
  });
});

app.get('/api/v1/jars/:userId', (req, res, next) => {
  Jar.find({ "users": {"$regex": req.params.userId} })
  .then(result => {
    if(result == null) {
      res.status(200).json( {
        message: "No Jars with that user!",
      });
    } else {
      console.log(result)
      res.status(200).json( {
        message: "Jars with that user found!",
        jars: result
      });
    }
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

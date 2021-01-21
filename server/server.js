require('dotenv').config();
const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const server = http.Server(app)
const User = require('./user.model')
const Admin = require('./admin.model')
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(session({
  secret: "My little secret string lol.",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// DB Connection
const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const dbURL = 'mongodb://localhost:27017/project309' //change this if you are using Atlas
mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }) 
mongoose.set("useCreateIndex", true);
mongoose.connection.on('error', (error) => {
        console.log(error);
    });


passport.use(Admin.createStrategy());
passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());

// your server routes go here
app.use('/css', express.static(path.join(__dirname , '../client/public/css')));
app.use('/files', express.static(path.join(__dirname , '../client/public/files')));
app.use('/img', express.static(path.join(__dirname , '../client/public/img')));
app.use('/js', express.static(path.join(__dirname , '../client/public/js')));


app.get('/', function(request, response){
    response.sendFile(path.join(__dirname , '../client/index.html'));
})


// Create a new admin user
app.post('/register', function(request, response){
  Admin.register({username: request.body.username}, request.body.password, function(err, user){
    if(err){
      console.log(err);
      response.redirect('/');
    } else {
      passport.authenticate("local")(request, response, function(){
        // message: 'admin user created successfully'
        response.redirect("/addStudent");
      })
    }
  })

  // var new_user = new Admin({
  //   username: request.body.username,
  //   password: request.body.password
  // });
  // // new_user.password = new_user.generateHash(request.password);
  // new_user.save(function (err, data){
  //     if (err)
  //       return response.status(400).json({
  //         error: 'data is missing'
  //       })
  //       return response.status(200).json({
  //         message: 'admin user created successfully'
  //     })
  // });
})

app.post('/', function(request, response){
  const user = new Admin({
    username: request.body.username,
    password: request.body.passport
  })
  request.login(user, function(err){
    if(err){
      console.log(err);
    } else {
      passport.authenticate("local")(request, response, function(){
        response.redirect("/addStudent");
      })
    }
  })

  // const username = request.body.username;
  // const password = request.body.password;
  // Admin.findOne({username: username}, function(err, user) {
  //   if(err){
  //     console.log(err);
  //     return response.status(400).json({
  //       error: 'data is missing'
  //     })
  //     // alert('Username or Password is incorrect!')
  //   }
  //   else{
  //     if(user){
  //       if(user.password===password){
  //           response.sendFile(path.join(__dirname , '../client/public/files/addStudent.html'));
  //       }
  //     }
  //   }
  // });
})

app.get('/logout', function(request, response){
  request.logout();
  response.redirect('/');
})

app.get('/dashboard', function(request, response){
    response.sendFile(path.join(__dirname , '../client/public/files/dashboard.html'));
})

app.get('/addStudent', function(request, response){
  if(request.isAuthenticated()){
    response.sendFile(path.join(__dirname , '../client/public/files/addStudent.html'));
  } else{
    response.redirect("/");
  }
})

app.get('/addTeacher', function(request, response){
  if(request.isAuthenticated()){
    response.sendFile(path.join(__dirname , '../client/public/files/addTeacher.html'));
  } else {
    response.redirect("/");
  }
})

app.get('/users/all', function(request, response){
    User.find({}, function (err, data) {
      if(err){
        return response.status(400).json({
          error: 'data is missing'
        })
      }
        // console.log(data);
      return response.status(200).json(JSON.stringify(data));
      })
})



app.post('/user/new', function(request, response){
    var newUser = new User(request.body)

    newUser.save(function (err, data) {
        if (err)
          return response.status(400).json({
            error: 'data is missing'
          })
        return response.status(200).json({
          message: 'Product created successfully'
        })
      })     
})

// app.put('/product/update/:id/:quantity/', (request, response) => {
//   Product.findByIdAndUpdate(request.params.id,{'quantity':request.params.quantity}, {new:true}, (err, data) => {
//     console.log(data);
//     if(err){
//       return response.status(400).json({
//         error: 'Request failed'
//       })
//     }
//     return response.status(200).json({
//       message: 'Product updated successfully'
//     })
//   })
// })

// app.delete('/product/:id', (request, response) => {
//   Product.findByIdAndRemove(request.params.id, (err, data) => {
//     if(err){
//       return response.status(400).json({
//         error: 'Request failed'
//       })
//     }
//     return response.status(200).json({
//       message: 'Product deleted successfully'
//     })
//   })
// })


server.listen(process.env.PORT || 3000,
  process.env.IP || 'localhost', function(){
  console.log('Server running');
})



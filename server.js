const express = require('express');
const path = require('path');
const base62 = require("base62");
const { check, validationResult } = require('express-validator/check');
const AppDAO = require('./models/dao');
const UrlRepository = require('./models/url');
const UserRepository = require('./models/users');
const passport = require('passport');
const bcrypt = require('bcrypt');
const userController = require('./controllers/user');
const session = require('express-session');
const bodyParser = require('body-parser');

// Init App
const app = express();

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
const dao = new AppDAO('./sqlite')
const urlRepo = new UrlRepository(dao)
const userRepo = new UserRepository(dao)

app.use(express.json());

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

// Passport Config
require('./config/passport')(passport, userRepo);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

urlRepo.createTable()
.then(() => console.log("Created table urls"));

app.get('*', function(req, res, next){
    res.locals.user = req.user || null;
    res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    next();
});

app.post('*', function(req, res, next){
    res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    next();
});

app.get('/', function(req, res){
  res.render('index')
});

app.get('/shorten-url', function(req, res){
  res.render('shorten-url')
});

app.post('/shorten-url', async function(req, res){
  url = req.body.url || '';
  if(url) {
    shortUrl= urlRepo.getByLongUrl(url)
    .then((result) => {
      if(!result) {
        return urlRepo.getMaxId()
        .then((maxRes) => {
          const id = maxRes ? maxRes.id + 1 : 1;
          newUrl = base62.encode(id);
          urlRepo.create(id, req.user.id, url, newUrl);
          return newUrl;
        })
      }
      else {
        return Promise.resolve((result.new_url))
      }
    })
    shortUrl.then((newUrl) => {
      res.render('shorten-url', {
        user: req.user,
        url: newUrl
      });
    })
  } else {
    console.log("Url field is empty.")
  }
});

app.get('/register', function(req, res){
  res.render('register')
});

app.post('/register',userController.validateUser(userRepo), function(req, res){
  const errors = validationResult(req);
  console.log(errors);
    if(!errors.isEmpty()) {
      console.log("Errors");
        for(var error of errors.array()) {
          console.log(error)
          if(error.param == "name")
            var nameErr = error.msg
          if(error.param == "email")
            var emailErr = error.msg
          if(error.param == "password")
            var passwordErr = error.msg
          if(error.param == "password2")
            var password2Err= error.msg
          }
      res.render('register', {
        nameErr: nameErr,
        emailErr: emailErr,
        passwordErr: passwordErr,
        password2Err: password2Err
      });
    } else {
      console.log("No errors");
      const {name, email, password, password2} = req.body;
      bcrypt.hash(password, 10, function(err, hash){
        if(err){
          console.log(err);
        }
        userRepo.create(name, email, hash)
        .then(user => {
          console.log("User created successfully");
          res.json(user)
        });
      });
    }
});

// Login Form
app.get('/login', function(req, res){
  res.render('login');
});

// Login Process
app.post('/login', function(req, res, next){
  passport.authenticate('local', {
    successRedirect:'/',
    failureRedirect:'/login',
    failureFlash: false
  })(req, res, next);
});

// logout
app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

app.get('/view-urls', ensureAuthenticated, function(req, res) {
  urlRepo.getAllByUserId(req.user.id)
  .then((urls) => {
    console.log(urls);
    res.render('view-urls', {
      user: req.user,
      enteries: urls
    });
  });
});


app.get('/:encoded_id', async function (req, res) {
    const encodedId = req.params.encoded_id;
    const id = base62.decode(encodedId);
    console.log(id);
    try {
        urlRepo.getById(id)
        .then((result) => {
          console.log(result);
          res.redirect(result.original_url)
        });
    }
    catch (e) {
        res.redirect("./");
    }
});

// Access Control
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    res.redirect('/login');
  }
}

app.listen(3000, function(){
  console.log("Server started on 3000.")
});

const express = require('express');
const path = require('path');
const AppDAO = require('./models/dao');
const UrlRepository = require('./models/url');
const UserRepository = require('./models/users');
const UserAccessRepository = require('./models/user-access');
const passport = require('passport');
const controller = require('./controllers/helper');
const session = require('express-session');
const bodyParser = require('body-parser');
const serverConfig = require('./config/server');
const dbConfig = require('./config/database');
const flash = require('connect-flash');


// Init App
const app = express();

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
const dao = new AppDAO(dbConfig.database.name);
const urlRepo = new UrlRepository(dao);
const userRepo = new UserRepository(dao);
const userAccessRepo = new UserAccessRepository(dao);
controller.initializeModels(userRepo, urlRepo, userAccessRepo);

app.use(express.json());

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: false
}));
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

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Passport Config
require('./config/passport')(passport, userRepo);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next) {
  res.locals.user = req.user || null;
  next();
});

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    next();
});

// Route Files
let auth = require('./routes/auth');
let user = require('./routes/users');
let protected = require('./routes/protected');
app.use('/auth', auth);
app.use('/user', user);
app.use('', protected);

app.listen(process.env.PORT || serverConfig.server.port, function() {
  console.log("Server started on 3000.")
});

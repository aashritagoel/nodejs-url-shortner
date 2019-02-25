const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const controller = require('../controllers/helper');
const userController = require('../controllers/user');
const dbConfig = require('../config/database');
const {check, validationResult} = require('express-validator/check');
const AppDAO = require('../models/dao');
const UrlRepository = require('../models/url');
const UserRepository = require('../models/users');
const UserAccessRepository = require('../models/user-access');
const serverConfig = require('../config/server');

const dao = new AppDAO(dbConfig.database.name)
const urlRepo = new UrlRepository(dao)
const userRepo = new UserRepository(dao)
const userAccessRepo = new UserAccessRepository(dao)

router.get('/register', function(req, res) {
  res.render('register')
});

router.post('/register', userController.validateUser(userRepo), function(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('register', controller.parseErrors(errors.array()));
  } else {
    const {name, email, password, password2 } = req.body;
    bcrypt.hash(password, 10, function(err, hash) {
      if (err)
        console.log(err);
      userRepo.create(name, email, hash)
        .then(user => {
          req.flash('success','You are now registered.');
          var sendMailRedirect = '/user/send?to=' + email;
          res.redirect(sendMailRedirect)
        });
    });
  }
});

router.get('/send', function(req, res) {
  var rand=Math.floor((Math.random() * 100) + 54);
  if (process.env.NODE_ENV) {
    var link = req.protocol + '://' + req.hostname
      + "/user/verify?id=" + rand + "&email=" + req.query.to;
  } else {
    var link = req.protocol + '://' + req.hostname + ':' + serverConfig.server.port
      + "/user/verify?id=" + rand + "&email=" + req.query.to;
  }
  userRepo.addSecret(req.query.to, rand);
  mailOptions={
      to : req.query.to,
      subject : "Please confirm your Email account",
      html : "Hello,<br> Please Click on the link to verify your email.<br><a href="
      + link
      + ">Click here to verify</a>"
    }
    controller.transporter.sendMail(mailOptions, function(error, response){
     if(error) {
        console.log(error);
        res.send("<h1>Internal message sending limit exceeded. Try logging using google</h1>");
      }
     else {
        req.flash('success', 'An email has been sent for verification. Please verify.');
        res.render('login');
      }
    });
});

router.get('/verify',function(req,res){
  var email = req.query.email;
  var hash = req.query.id;
  userRepo.checkSecret(email, hash)
  .then((id) => {
    if(id) {
      console.log(id);
      userRepo.updateStatus(email)
      .then(() => {
        req.flash('success', 'Email is verified. Login to continue.');
        res.redirect('/user/login');
      })
    }
    else {
      res.end("<h1>Bad Request</h1>");
    }
  });
});

router.get('/login', function(req, res) {
  res.render('login');
});

router.post('/login', function(req, res, next) {
  passport.authenticate('local', {
    successRedirect: '/shorten-url',
    failureRedirect: '/user/login',
    failureFlash: true
  })(req, res, next);
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;

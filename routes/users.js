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
          req.flash('success','You are now registered and can log in');
          res.redirect('/user/login')
        });
    });
  }
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

const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

router.get('/google/callback',
  passport.authenticate('google', {
    successRedirect: '/shorten-url',
    failureRedirect: '/'
  }),
  function(req, res) {
    res.redirect('/shorten-url');
  }
);

router.get('/facebook',
  passport.authenticate('facebook', {
    scope: ['profile', 'email']
  })
);

router.get('/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/'
  }),
  function(req, res) {
    res.redirect('/shorten-url');
  }
);

module.exports = router;

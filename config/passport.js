const LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const bcrypt = require('bcrypt');
var configAuth = require('./auth');

module.exports = function(passport, userRepo) {

  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, function(username, password, done) {
    userRepo.getByEmail(username)
      .then((user) => {
        if (!user) {
          return done(null, false, {
            message: 'No user exists with this email!'
          });
        }
        userRepo.getUserKey(user.id)
        .then((userKey) => {
          if(!userKey) {
            return done(null, false, {
              message: 'This email was used to sign in with google! Try signing with Google'
            });
          }
          bcrypt.compare(password, userKey.password, function(err, isMatch) {
            if (err) console.log(err);
            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, {
                message: 'Wrong password'
              });
            }
          });
        })
      });
  }));

  passport.use(new GoogleStrategy({
    clientID: configAuth.googleAuth.clientID,
    clientSecret: configAuth.googleAuth.clientSecret,
    callbackURL: configAuth.googleAuth.callbackURL,
  }, function(token, refreshToken, profile, done) {
    process.nextTick(function() {
      userRepo.getById(profile.id)
        .then((user) => {
          if (user) {
            return done(null, user);
          } else {
            userRepo.createUser(
              profile.displayName,
              profile.emails[0].value,
              "google"
            ).then((newUser) => {
              return done(null, newUser);
            });
          }
        });
    });
  }));

  passport.use(new FacebookStrategy({
    clientID: configAuth.facebookAuth.clientID,
    clientSecret: configAuth.facebookAuth.clientSecret,
    callbackURL: configAuth.facebookAuth.callbackURL
  }, function(token, refreshToken, profile, done) {
    process.nextTick(function() {
      userRepo.getById(profile.id)
        .then((user) => {
          if (user) {
            return done(null, user);
          } else {
            userRepo.createUser(
              profile.displayName,
              profile.emails[0].value,
              "facebook"
            ).then((newUser) => {
              return done(null, newUser);
            });
          }
        });
    });
  }));

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    userRepo.getById(id)
      .then((user, err) => {
        done(err, user);
      })
  });

}

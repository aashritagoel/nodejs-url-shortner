const {
  check
} = require('express-validator/check')

exports.validateUser = (userRepo) => {
  return [
    check('name').not().isEmpty().withMessage("Username should not be empty"),
    check('email').isEmail().withMessage("Invalid email"),
    check('password').isLength({
      min: 5
    }).withMessage("Password must be atleast 5 characters"),
    check('password2').custom((value, {
      req
    }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match password');
      } else {
        return true;
      }
    }),
    check('email').custom(value => {
      return userRepo.getByEmail(value).then(user => {
        if (user)
          return Promise.reject('Email already exists.');
      });
    })
  ]
}

exports.validateUrl = (urlRepo) => {
  return [
    check('url').isURL().withMessage('Invalid URL Entered.'),
    check('shorturl').isLength({
      max: 6
    }).withMessage("Custom url must be atmost 6 characters"),
    check('shorturl').custom(value => {
      return urlRepo.getByShortUrl(value).then(url => {
        if (url)
          return Promise.reject('Custom url is not available.');
      });
    })
  ]
}

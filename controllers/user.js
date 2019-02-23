const { check } = require('express-validator/check')

exports.validateUser = (userRepo) => {
       return [
         check('name').not().isEmpty().withMessage("Username should not be empty"),
         check('email').isEmail().withMessage("Invalid email"),
         check('password').isLength({ min: 5 }).withMessage("Password must be atleast 5 characters"),
         check('password2').custom((value, { req }) => {
           if (value !== req.body.password) {
             throw new Error('Passwords do not match password');
           } else {
             return true;
           }
         }),
         check('name').custom(value => {
           return userRepo.getByUsername(value).then(user => {
             if (user) {
               return Promise.reject('Username already exists.');
             }
           });
         }),
         check('email').custom(value => {
           return userRepo.getByEmail(value).then(user => {
             if (user)
               return Promise.reject('Email already exists.');
           });
         })
        ]
}

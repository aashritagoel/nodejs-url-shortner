exports.parseErrors = (errors) => {
  for (var error of errors) {
    if (error.param == "name")
      var nameErr = error.msg
    if (error.param == "email")
      var emailErr = error.msg
    if (error.param == "password")
      var passwordErr = error.msg
    if (error.param == "password2")
      var password2Err = error.msg
  }
  return {
    nameErr: nameErr,
    emailErr: emailErr,
    passwordErr: passwordErr,
    password2Err: password2Err
  }
}

exports.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash('danger', 'Please login');
    res.redirect('/user/login');
  }
}

exports.initializeModels = (userRepo, urlRepo, userAccessRepo) => {
  urlRepo.createTable()
    .then(() => userAccessRepo.createTable())
    .then(() => userRepo.createUserTable())
    .then(() => userRepo.createUserKeyTable())
}

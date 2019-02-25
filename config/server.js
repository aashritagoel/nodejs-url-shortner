exports.server = {
        api:'',
        port: 3000,
        host: 'http://localhost:3000/'
};

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

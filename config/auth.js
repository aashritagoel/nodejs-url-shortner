module.exports = {

  'googleAuth' : {
     'clientID'      : process.env.GOOGLE_KEY || 'your-clientID',
     'clientSecret'  : process.env.GOOGLE_SECRET || 'your-secret',
     'callbackURL'   : '/auth/google/callback'
 },

 'emailCredentials' : {
      'user' : process.env.EMAIL_KEY || 'your-email',
      'pass' : process.env.EMAIL_SECRET || 'your-password'
 },

 'facebookAuth' : {
     'clientID'      : 'paste-your-clientid', 
     'clientSecret'  : 'paste-your-clientSecret',
     'callbackURL'   : '/auth/facebook/callback'
 }

};

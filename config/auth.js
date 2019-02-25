module.exports = {

  'googleAuth' : {
     'clientID'      : process.env.GOOGLE_KEY || 'your-clientID',
     'clientSecret'  : process.env.GOOGLE_SECRET || 'your-secret',
     'callbackURL'   : '/auth/google/callback'
 },

 'facebookAuth' : {
     'clientID'      : 'paste-your-clientid', // your App ID
     'clientSecret'  : 'paste-your-clientSecret', // your App Secret
     'callbackURL'   : '/auth/facebook/callback'
 }

};

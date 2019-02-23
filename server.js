const express = require('express');
const path = require('path');
const base62 = require("base62");
const AppDAO = require('./models/dao');
const UrlRepository = require('./models/url');
const UserRepository = require('./models/users');
const bodyParser = require('body-parser');

// Init App
const app = express();

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
const dao = new AppDAO('./sqlite')
const urlRepo = new UrlRepository(dao)
const userRepo = new UserRepository(dao)

userRepo.createTable()
    .then(() => urlRepo.createTable())
    .then(() => urlRepo.create("abc", "def"))
    .then((data) => {
      console.log(data)
    })

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', function(req, res, next){
    res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    next();
});

app.post('*', function(req, res, next){
    res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    next();
});

app.get('/', function(req, res){
  res.render('shorten-url')
});

app.post('/', async function(req, res){
  url = req.body.url || '';
  if(url) {
    shortUrl= urlRepo.getByLongUrl(url)
    .then((result) => {
      if(!result) {
        return urlRepo.getMaxId()
        .then((maxRes) => {
          const id = maxRes.id > 0 ? maxRes.id + 1 : 1;
          newUrl = base62.encode(id);
          urlRepo.create(url, new1);
          return newUrl;
        })
      }
      else {
        return Promise.resolve((result.new_url))
      }
    })
    shortUrl.then((newUrl) => {
      res.render('shorten-url', {
        url: newUrl
      });
    })
  } else {
    console.log("Url field is empty.")
  }
});

app.get('/:encoded_id', async function (req, res) {
    const encodedId = req.params.encoded_id;
    const id = base62.decode(encodedId);
    try {
        urlRepo.getById(id)
        .then((result) => {
          res.redirect(result.original_url)
        });
    }
    catch (e) {
        res.redirect("./");
    }
});

app.listen(3000, function(){
  console.log("Server started on 3000.")
});

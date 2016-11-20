var express = require('express');
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;
var multipart = require('connect-multiparty');

const fs = require('fs');

const encryptor = require('file-encryptor');
const crypto = require('crypto');

var JsonDB = require('node-json-db');

var users = new JsonDB("users", true, false);
var media = new JsonDB("media", true, false);

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
};

function getHash(filepath){
  const hash = crypto.createHash('sha256');

  const input = fs.createReadStream(filename);
  
  input.on('readable', () => {
    var data = input.read();
    if (data)
      hash.update(data);
    else {
      return hash.digest('hex');     
    }
  });
};

function getPwd(){
  return crypto.randomBytes(33).toString('hex');
};

passport.use(new Strategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/login/facebook/return'
  },
  function(accessToken, refreshToken, profile, cb) {
    return cb(null, profile);
  }));

passport.serializeUser(function(user, cb) {
  try{
    var local = users.getData('/facebook/' + user.id);
    if(!!local.address){
      user.address = local.address;
    } else {
      //generate new address here
      local.address = getPwd();
      user.address = local.address;
      users.push('/facebook/' + user.id, {address: local.address});
    }
    users.push('/facebook/'+ user.id + '/raw', user);
    users.push('/facebook/'+ user.id + '/name', user.displayName);
  } catch(error)
  {
    //user not found
    users.push('/facebook/' + user.id, {name: user.displayName, raw: user});
    //generate new address here
    var address = getPwd();
    user.address = address;
    users.push('/facebook/' + user.id, {address: address});
  }
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

// Create a new Express application.
var app = express();

app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

//public folder 
app.use('/', express.static('public/app'));

// Define routes.
app.get('/login/facebook',
  passport.authenticate('facebook'));

app.get('/login/facebook/return', 
  passport.authenticate('facebook', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.status(200).json({user: req.user});
  });

var multipartMiddleware = multipart();
app.post('/fileupload',
  require('connect-ensure-login').ensureLoggedIn(),function(req, res, next)
{
  next();
});

app.post('/fileupload',multipartMiddleware,  
  function(req, res){
    //check data
    if(req.body.medianame && req.body.mediaprice && req.files.uploadedFile){
      
      var filepath = req.files.uploadedFile.path;
      var encpath = req.files.uploadedFile.path + '.dat';
      var medianame = req.body.medianame;
      var mediaprice = req.mediaprice;
      var mediaid = getRandomInt(10000, 999999999999);
      var mediahash = getHash(filepath);
      var userid = req.user.id;

      var key = getPwd() + 'darkchain';

      // Encrypt file.
      encryptor.encryptFile(filepath, encpath, key, function(err) {
        fs.unlinkSync(filepath);

        media.push('/files/' + userid, { mediaid: mediaid, medianame: medianame, mediahash:mediahash, file:encpath});
        
        res.status(200).json({message: "Media file uploaded sucessfully.", status:"ok"});
        
      });

      // Decrypt file.
      /*encryptor.decryptFile('encrypted.dat', 'output_file.txt', key, function(err) {
        // Decryption complete.
      });*/

            
    } else {

      res.status(200).json({message: "", status:"error", error: "Incorrect data"});

    }
    
  }
);

app.get('/api/list',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    const files = media.getData('/files');
    res.status(200).json(files);
  });

app.listen(3000);

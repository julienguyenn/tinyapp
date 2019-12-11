const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

function generateRandomString() {
  const possibleChars = 'ABCDEFGHIJKLMOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let newString = '';
  for (let i = 0; i < 6; i++) {
    const index = Math.floor(Math.random() * possibleChars.length);
    newString += possibleChars[index];
  }
  return newString;
}

const users = {
};

function lookupEmail (email) {
  for (let user in users) {
    if (user.email === email) {
      return true;
    }
  }
  return false;
}

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b> World</b></body></html>\n')
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/register', (req, res) => {
  let templateVars = { user_id
    : req.cookies["user_id"]};
  res.render('registration.ejs', templateVars);
})

app.post('/register', (req, res) => {
  const randomID = generateRandomString();
  const email = req.body.emailAddress;
  const password = req.body.pwd;
  if (email === "" || password === "") {
    res.statusCode = 400;
    res.send('ERROR 400: Please fill out email and password')
  } else if (lookupEmail(email)) { 
    res.statusCode = 400;
    res.send('ERROR 400: Email already exist!');
  } else {
    users[randomID] = { id: randomID, email: email, password: password };
    res.cookie('user_id', randomID);
  }
  res.redirect('/urls');
});

// For iterating through an object
app.get('/urls', (req, res) => {
  let templateVars = { user_id: req.cookies["user_id"], urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  let templateVars = { user_id: req.cookies["user_id"]};
  res.render('urls_new', templateVars);
});

app.get('/login', (req, res) => {
  let templateVars = { user_id: req.cookies["user_id"]};
  res.render('login.ejs', templateVars);
});

app.post('/login', (req, res) => {
  if (lookupEmail(req.body.emailAddress)) {
    const user_id = req.body.user_id;
    res.cookie('user_id', user_id)
  } else if (lookupEmail(req.body.emailAddress)) {
    res.statusCode = 403;
    res.send("ERROR 403: Email does not exist!")
  } //////// LEFT OFF HERE////////////////******************************* */
  res.redirect('/urls')
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id')
  res.redirect('/urls')
});

// Redirection for creating non-existing URL
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:shortURL/edit', (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = { user_id: req.cookies["user_id"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] }
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});  

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL]
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});

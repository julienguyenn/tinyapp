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
  "aJ48lW": {
    id:  "aJ48lW",
    email: "123@123.com",
    password: "123"
  }
};

function lookupEmail (email) {
  for (let user in users) {
    if (users[user].email === email) {
      return [true, user, users[user].password];
    }
  }
  return [false];
};


const urlDatabase = {
  'b2xVn2': {longURL: 'http://www.lighthouselabs.ca', userID:  "aJ48lW"},
  '9sm5xK': {longURL: 'http://www.google.com', userID:  "aJ48lW"}
};


function urlsForUser (id) {
  let userUrls = {};
  for (url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userUrls[url] = urlDatabase[url].longURL;
    }
  }
  return userUrls;
}

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
  let templateVars = { user_id: req.cookies["user_id"], users: users };
  res.render('registration.ejs', templateVars);
})

app.post('/register', (req, res) => {
  const email = req.body.emailAddress;
  const password = req.body.pwd;
  if (email === "" || password === "") {
    res.statusCode = 400;
    res.send('ERROR 400: Please fill out email and password')
  } else if (lookupEmail(email)[0]) { 
    res.statusCode = 400;
    res.send('ERROR 400: Email already exist!');
  } else {
    const randomID = generateRandomString();
    console.log('here');
    users[randomID] = { id: randomID, email: email, password: password };
    console.log(users);
    res.cookie('user_id', randomID);
  }
  res.redirect('/urls');
});

// For iterating through an object
app.get('/urls', (req, res) => {
  const userURLs = urlsForUser(req.cookies["user_id"]);
  let templateVars = { user_id: req.cookies["user_id"], urls: userURLs, users: users };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  if (req.cookies["user_id"] === undefined) {
    res.redirect("/login");
  } else {
    let templateVars = { user_id: req.cookies["user_id"], users: users };
    res.render('urls_new', templateVars);
  }
});

app.get('/login', (req, res) => {
  let templateVars = { user_id: req.cookies["user_id"], users: users };
  res.render('login.ejs', templateVars);
});

app.post('/login', (req, res) => {
  const lookupEmailResult = lookupEmail(req.body.emailAddress);
  if (lookupEmailResult[0]) {
    if (req.body.pwd === lookupEmailResult[2]) {
      res.cookie('user_id', lookupEmailResult[1]);
      res.redirect('/urls')
    } else {
      res.statusCode = 403;
      res.send("ERROR 403: Password does not match email")
    }
  } else if (!lookupEmailResult[0]) {
    res.statusCode = 403;
    res.send("ERROR 403: Email does not exist!")
  }
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
  if (req.cookies["user_id"]) {
    const shortURL = req.params.shortURL;
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = longURL;
  }
  res.redirect('/urls');
});

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = { user_id: req.cookies["user_id"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, users: users }
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});  

app.post('/urls/:shortURL/delete', (req, res) => {
  if (req.cookies["user_id"]) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL]
  }
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});

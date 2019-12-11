const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['user_id'],
}));

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

function getUserByEmail (email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
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
  let templateVars = { user_id: req.session.user_id, users: users };
  res.render('registration.ejs', templateVars);
})

app.post('/register', (req, res) => {
  const email = req.body.emailAddress;
  const password = bcrypt.hashSync(req.body.pwd, 10);
  if (email === "" || password === "") {
    res.statusCode = 400;
    res.send('ERROR 400: Please fill out email and password')
  } else if (getUserByEmail(email, users)) { 
    res.statusCode = 400;
    res.send('ERROR 400: Email already exist!');
  } else {
    const randomID = generateRandomString();
    users[randomID] = { id: randomID, email: email, password: password };
    req.session.user_id = randomID;
  }
  res.redirect('/urls');
});

// For iterating through an object
app.get('/urls', (req, res) => {
  const userURLs = urlsForUser(req.session.user_id);
  let templateVars = { user_id: req.session.user_id, urls: userURLs, users: users };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  if (req.session.user_id === undefined) {
    res.redirect("/login");
  } else {
    let templateVars = { user_id: req.session.user_id, users: users };
    res.render('urls_new', templateVars);
  }
});

app.get('/login', (req, res) => {
  let templateVars = { user_id: req.session.user_id, users: users };
  res.render('login.ejs', templateVars);
});

app.post('/login', (req, res) => {
  const lookupEmailResult = getUserByEmail(req.body.emailAddress, users);
  console.log(lookupEmailResult)
  if (lookupEmailResult) {
    if (bcrypt.compareSync(req.body.pwd, lookupEmailResult.password)) {
      req.session.user_id = lookupEmailResult.id;
      res.redirect('/urls')
    } else {
      res.statusCode = 403;
      res.send("ERROR 403: Password does not match email")
    }
  } else {
    res.statusCode = 403;
    res.send("ERROR 403: Email does not exist!")
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls')
});

// Redirection for creating non-existing URL
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id };
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:shortURL/edit', (req, res) => {
  if (req.session.user_id) {
    const shortURL = req.params.shortURL;
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = { longURL: longURL, userID: req.session.user_id };
  }
  res.redirect('/urls');
});

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = { user_id: req.session.user_id, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, users: users }
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});  

app.post('/urls/:shortURL/delete', (req, res) => {
  if (req.session.user_id) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL]
  }
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`)
});

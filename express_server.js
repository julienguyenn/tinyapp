const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { getUserByEmail } = require('./helpers');
const { generateRandomString } = require('./helpers');
const { urlsForUser } = require('./helpers');


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['user_id'],
}));

const users = {
};

const urlDatabase = {
  'abc': { longURL: 'http://www.google.com', userID: '123'}
};

app.get('/', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login')
  }
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
  const userURLs = urlsForUser(req.session.user_id, urlDatabase);
  let templateVars = { user_id: req.session.user_id, urls: userURLs, users: users };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  if (req.session.user_id === undefined) {
    res.redirect("/login");
  } else {
    let templateVars = { user_id: req.session.user_id, users: users};
    res.render('urls_new', templateVars);
  }
});

app.get('/login', (req, res) => {
  let templateVars = { user_id: req.session.user_id, users: users };
  res.render('login.ejs', templateVars);
});

app.post('/login', (req, res) => {
  const lookupEmailResult = getUserByEmail(req.body.emailAddress, users);
  if (lookupEmailResult) {
    if (bcrypt.compareSync(req.body.pwd, users[lookupEmailResult].password)) {
      req.session.user_id = users[lookupEmailResult].id;
      res.redirect('/urls')
    } else {
      res.statusCode = 403;
      res.send("ERROR 403: Password does not match email");
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
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id, visitors: 0 };
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
  let templateVars = { user_id: req.session.user_id, shortURL: req.params.shortURL, users: users, longURL: undefined, owner: false, urls: urlsForUser(req.session.user_id, urlDatabase)}
  if (urlDatabase[req.params.shortURL]) {
    templateVars.longURL = urlDatabase[req.params.shortURL].longURL;
    if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
      templateVars.owner = true;
    }
  }
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    urlDatabase[req.params.shortURL].visitors+= 1;
    res.redirect(longURL);
  } else {
    res.statusCode = 400;
    res.send("404 Not Found.")
  }
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

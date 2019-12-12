const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const { urlsForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  q1h3Gr: { longURL: "facebook.com", userID: "gew22h" }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.equal(user, expectedOutput);
  });

  it('should return undefined with an invalid email', function() {
    const user = getUserByEmail("123@123.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});

describe('urlsForUser', function() {
  it('should return the correct urls for a valid user', function() {
    const urls = urlsForUser("aJ48lW", urlDatabase);
    const expectedOutput = {
      b6UTxQ: "https://www.tsn.ca",
      i3BoGr: "https://www.google.ca"
    }
    assert.deepEqual(urls, expectedOutput);
  });

  it('should return no urls if the user does not have any urls', function() {
    const urls = urlsForUser("aUser", urlDatabase);
    const expectedOutput = {};
    assert.deepEqual(urls, expectedOutput);
  });
})
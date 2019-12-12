// Returns the user if the email is associated with any user in the data
function getUserByEmail (email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return user;
    }
  }
}

function generateRandomString() {
  const possibleChars = 'ABCDEFGHIJKLMOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let newString = '';
  for (let i = 0; i < 6; i++) {
    const index = Math.floor(Math.random() * possibleChars.length);
    newString += possibleChars[index];
  }
  return newString;
}

function urlsForUser (id, urlData) {
  let userUrls = {};
  for (url in urlData) {
    if (urlData[url].userID === id) {
      userUrls[url] = urlData[url].longURL;
    }
  }
  return userUrls;
}; 

module.exports = { getUserByEmail, generateRandomString, urlsForUser }
var express = require('express');
var router = express.Router();

const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../../config');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('hello from users');
});

/*------------------------------------------ SignUp ---------------------------*/
router.post('/signup',async function (req, res, next) {
  res.send('hello from users');

});

/*------------------------------------------ Login ---------------------------*/
router.post('/login',async function (req, res, next) {
  res.send('hello from users');

});

/*------------------------------------------ Generate JWT Token ---------------------------*/
function generateToken(user) {

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username
    },
    SECRET_KEY,
    { expiresIn: '1h' }
  );
}

module.exports = router;

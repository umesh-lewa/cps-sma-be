var express = require('express');
var router = express.Router();

const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../../config');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('hello from users');
});

/*------------------------------------------ SignUp ---------------------------*/
router.post('/signup', async function (req, res, next) {
  res.send('hello from users');

});

/*------------------------------------------ Login ---------------------------*/
router.post('/login', async function (req, res, next) {

  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  const user = await User.findOne({ email });

  if (!user) {
    return res.json({
      "stat": "failure",
      "message": "User does not exist"
    });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.json({
      "stat": "failure",
      "message": "Email or Password in Incorrect"
    });
  }

  const token = generateToken(user);

  res.json({
    "stat": "200",
    "message": "Succeccfully Logged In",
    "token": token
  });

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

/*------------------------------------------ Add Follower ---------------------------*/
router.post('/addFollower', function (req, res, next) {
  res.send('hello from users');
});

/*------------------------------------------ Reset Password ---------------------------*/
router.get('/resetPassword', function (req, res, next) {
  res.send('hello from users');
});

module.exports = router;

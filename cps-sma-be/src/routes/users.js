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

  const username = req.body.username;
  const email = req.body.email;
  let password = req.body.password;

  const user = await User.findOne({ username });

  if (user) {
    return res.status(400).json({
      "message": "Username Already Exists"
    });
  }

  const user1 = await User.findOne({ email });

  if (user1) {
    return res.status(400).json({
      "message": "Email Already Exists"
    });
  }

  // hash password and create an auth token
  password = await bcrypt.hash(password, 12);

  const newUser = new User({
    email,
    username,
    password,
    createdAt: new Date().toISOString()
  });

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

var express = require('express');
var router = express.Router();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { SECRET_KEY } = require('../../config');

var nodemailer = require("nodemailer");

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('hello from users');
});

var smtpTransport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "Your Gmail ID",
    pass: "Your Gmail Password"
  }
});

var rand, mailOptions, host, link;

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

  rand = Math.floor((Math.random() * 100) + 54);
  host = "cps-sma-umesh.herokuapp.com"
  link = "https://" + host + "/users/verify/" + rand;
  mailOptions = {
    to: email,
    subject: "Please confirm your Email account",
    html: "Hello,<br> Please Click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>"
  }
  console.log(mailOptions);
  smtpTransport.sendMail(mailOptions,async function (error, response) {
    if (error) {
      console.log(error);
      return res.json({
        "message": "Error in Sending Verification Mail"
      });
    } else {
      console.log("Message sent: " + response.message);

      const newUser = new User({
        email,
        username,
        password,
        emailActivationKey: rand,
        activeStatus: false,
        createdAt: new Date().toISOString()
      });

      const saveUserResponse = await newUser.save();

      return res.json({
        "message": "Verification Mail Sent,Please Verify"
      });

    }
  });


  //const token = generateToken(response);

  /*
  res.json({
    "status": "200",
    "message": "Successfully Registered, Please Log In",
  });
  */

});

/*------------------------------------------ Verify Confirmation Email ---------------------------*/
router.get('/verify/:key',async function (req, res) {

    console.log(req.protocol + ":/" + req.get('host'));

    let emailActivationKey = req.params.key;
    const user = await User.findOne({ emailActivationKey });

    if (req.params.key == user.emailActivationKey) {
      console.log("email is successfully verified");
      //res.end("<h1>Email " + mailOptions.to + " is been Successfully verified");
      res.redirect("https://thirsty-allen-2b6ab5.netlify.app/registerEmailConfirm");
    }else {
      console.log("email is not verified");
      res.end("<h1>Bad Request</h1>");
    }

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

  if (!user.activeStatus) {
    return res.json({
      "stat": "failure",
      "message": "User has not verified email"
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

/*------------------------------------------ Edit User Details ---------------------------*/
router.patch('/editUserDetails',async function(req,res,next){

  let username = req.body.username;

  const user = await User.findOne({ username });

  if (user) {
    return res.status(400).json({
      "message": "Username Already Exists"
    });
  }

});

/*------------------------------------------ Add Follower ---------------------------*/
router.post('/addFollower', function (req, res, next) {
  res.send('hello from users');
});

/*------------------------------------------ Reset Password ---------------------------*/
router.get('/resetPassword', function (req, res, next) {
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

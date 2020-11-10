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

/*------------------------------------------ Nodemailer Config ---------------------------*/
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

  try {

    const user = await User.findOne({ username });

    if (user) {
      return res.status(500).json({
        "message": "Username Already Exists"
      });
    }

    const user1 = await User.findOne({ email });

    if (user1) {
      return res.status(500).json({
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
    smtpTransport.sendMail(mailOptions, async function (error, response) {
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
          "stat": "200",
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

  } catch (err) {
    console.log(err);
    res.json({
      "stat": "500",
      "message": "Error in Registering User"
    });
  }

});

/*------------------------------------------ Verify Confirmation Email ---------------------------*/
router.get('/verify/:key', async function (req, res) {

  console.log(req.protocol + ":/" + req.get('host'));

  let emailActivationKey = req.params.key;
  const user = await User.findOne({ emailActivationKey });

  if (req.params.key == user.emailActivationKey) {

    await User.updateOne({ "emailActivationKey": emailActivationKey }, { activeStatus: true });
    console.log("email is successfully verified");
    //res.end("<h1>Email " + mailOptions.to + " is been Successfully verified");
    //res.redirect("https://thirsty-allen-2b6ab5.netlify.app/registerEmailConfirm");
    res.send('Email Successfully Verified, Please Log In');
  } else {
    console.log("email is not verified");
    res.end("<h1>Bad Request</h1>");
  }

});

/*------------------------------------------ Login ---------------------------*/
router.post('/login', async function (req, res, next) {

  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  try {

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
      "token": token,
      "username": user.username,
      "createdAt": user.createdAt,
      "id": user._id,
    });

  } catch (err) {
    console.log(err);
    res.json({
      "stat": "500",
      "message": "Error in Logging In User"
    });
  }

});

/*------------------------------------------ Get All Users ---------------------------*/
router.get('/getUsers', async function (req, res, next) {

  try {

    const users = await User.find();

    res.json({
      "stat": "200",
      "message": "Successfully Fetched Users",
      "users": users
    });

  } catch (err) {
    console.log(err);
    res.json({
      "stat": "500",
      "message": "Error in fetching users"
    });
  }

});

/*------------------------------------------ Get Single User Details ---------------------------*/
router.get('/getUser/:usermail', async function (req, res, next) {

  let usermail = req.params.usermail;

  try {

    const users = await User.findOne({ "email": usermail });

    res.json({
      "stat": "200",
      "message": "Successfully Fetched single user data",
      "username": users.username,
      "firstname": users.firstname,
      "lastname": users.lastname,
      "address": users.address,
      "intro": users.intro,
    });

  } catch (err) {
    console.log(err);
    res.json({
      "stat": "500",
      "message": "Error in fetching single user data"
    });
  }

});

/*------------------------------------------ Search For Users ---------------------------*/
router.get('/searchUsers/:currentUserEmail/:searchTerm', async function (req, res, next) {

  let searchTerm = req.params.searchTerm;
  let currentUserEmail = req.params.currentUserEmail;

  try {

    let searchResultUsers = [];

    let currenUser = await User.find({ "email": currentUserEmail }, function (err, docs) {
      console.log("searchTerm Current user fetch");
      console.log("docs : " + docs);
      searchResultUsers.push(...docs);
    });

    await User.find({ "username": { $regex: searchTerm, $options: "i" } }, function (err, docs) {
      console.log("searchTerm Search Begins");
      console.log("docs : " + docs);
      searchResultUsers.push(...docs);
    });

    res.json({
      "stat": "200",
      "message": "Successfully Fetched Users",
      "users": searchResultUsers
    });

  } catch (err) {
    console.log(err);
    res.json({
      "stat": "500",
      "message": "Error in fetching searched users"
    });
  }

});

/*------------------------------------------ Edit User Details ---------------------------*/
router.patch('/editUserDetails', async function (req, res, next) {

  try {

    let usermail = req.body.usermail;
    let username = req.body.username;
    console.log("usermail : " + usermail);
    console.log("username : " + username);

    if (username) {
      let currentUser = await User.findOne({ "email": usermail });
      console.log("currentUser : " + JSON.stringify(currentUser));
      console.log("currentUser.username : " + currentUser.username);
      if (username == currentUser.username) {
        console.log("same username , so ignoring username field");
      } else {
        let testUser = await User.findOne({ "username": username });
        if (testUser) {
          return res.json({
            "stat": "500",
            "message": "Username Already Exists"
          });
        } else {
          await User.updateOne({ "email": usermail }, { "username": username });
        }
      }
    }
    let firstname = req.body.firstname;
    if (firstname) {
      await User.updateOne({ "email": usermail }, { "firstname": firstname });
    }
    let lastname = req.body.lastname;
    if (lastname) {
      await User.updateOne({ "email": usermail }, { "lastname": lastname });
    }
    let address = req.body.address;
    if (address) {
      await User.updateOne({ "email": usermail }, { "address": address });
    }
    let intro = req.body.intro;
    if (intro) {
      await User.updateOne({ "email": usermail }, { "intro": intro });
    }

    res.json({
      "stat": "200",
      "message": "Successfully updated user details",
    });

  } catch (err) {
    console.log(err);
    res.json({
      "stat": "500",
      "message": "Error in updating user details"
    });
  }

});

/*------------------------------------------ Add Following ---------------------------*/
router.post('/addFollowing', async function (req, res, next) {

  let currentUserName = req.body.currentUserName;
  let userNameToFollow = req.body.userNameToFollow;

  let currentUserId;
  let userIdToFollow;
  let userEmailToFollow;

  try {

    let followuser = await User.findOne({ "username": userNameToFollow }, function (err, data) {
      if (err) return console.error(err);
      userIdToFollow = data._id;
      userEmailToFollow = data.email;
    });

    let currentUser = await User.findOne({ "username": currentUserName }, function (err, data) {
      if (err) return console.error(err);
      currentUserId = data._id;
    });

    console.log("userIdToFollow : " + userIdToFollow);
    console.log("userEmailToFollow : " + userEmailToFollow);
    console.log("currentUserId : " + currentUserId);

    /*
    const user = await User.findOneAndUpdate({ currentUserName }, {
      $push: {
        "following": userIdToFollow,
      }
    });
    */

    /*
    let updatedCurrentUser = await User.findOne({ "username": currentUserName }, function(error, user) {
      if (error) {
        return handleError(error);
      }

      user.following.push(userIdToFollow);
      //user.following.$push = userEmailToFollow;

      user.save();
      console.log("Added Following to current User"); 
    });

    console.log("updatedCurrentUser : "+updatedCurrentUser);
    */

    await User.updateOne({ "username": currentUserName }, { $addToSet: { following: userIdToFollow } });
    await User.findOneAndUpdate({ "username": currentUserName }, { $inc: { followingCount: 1 } });
    await User.updateOne({ "username": userNameToFollow }, { $addToSet: { followers: currentUserId } });
    await User.findOneAndUpdate({ "username": userNameToFollow }, { $inc: { followersCount: 1 } });

    //const user1 = await User.findOne({ userNameToFollow });
    res.json({
      "stat": "200",
      "message": "Successfully added Following"
    });

  } catch (err) {
    console.log(err);
    res.json({
      "stat": "500",
      "message": "Error in adding Following"
    });
  }

});

/*------------------------------------------ Remove Following ---------------------------*/
router.post('/removeFollowing', async function (req, res, next) {

  let currentUserName = req.body.currentUserName;
  let userNameToUnFollow = req.body.userNameToUnFollow;

  let currentUserId;
  let userIdToUnFollow;
  let userEmailToUnFollow;

  try {

    let unFollowuser = await User.findOne({ "username": userNameToUnFollow }, function (err, data) {
      if (err) return console.error(err);
      userIdToUnFollow = data._id;
      userEmailToUnFollow = data.email;
    });

    let currentUser = await User.findOne({ "username": currentUserName }, function (err, data) {
      if (err) return console.error(err);
      currentUserId = data._id;
    });

    console.log("userIdToUnFollow : " + userIdToUnFollow);
    console.log("userEmailToUnFollow : " + userEmailToUnFollow);
    console.log("currentUserId : " + currentUserId);

    await User.updateOne({ "username": currentUserName }, { $pull: { following: userIdToUnFollow } });
    await User.findOneAndUpdate({ "username": currentUserName }, { $inc: { followingCount: -1 } });
    await User.updateOne({ "username": userNameToUnFollow }, { $pull: { followers: currentUserId } });
    await User.findOneAndUpdate({ "username": userNameToUnFollow }, { $inc: { followersCount: -1 } });

    //const user1 = await User.findOne({ userNameToFollow });
    res.json({
      "stat": "200",
      "message": "Successfully removed Following"
    });

  } catch (err) {
    console.log(err);
    res.json({
      "stat": "500",
      "message": "Error in remove Following"
    });
  }

});



/*------------------------------------------ Add Follower ---------------------------*/
// router.post('/addFollower', function (req, res, next) {
//   res.send('hello from users');
// });


/*------------------------------------------ Verify Reset Password Email ---------------------------*/
router.get('/verifyResetPassword/:key', async function (req, res) {

  let resetPasswordKey = req.params.key;
  const user = await User.findOne({ emailActivationKey });

  if (req.params.key == user.emailActivationKey) {

    await User.updateOne({ "emailActivationKey": emailActivationKey }, { activeStatus: true });
    //console.log("email is successfully verified");
    res.redirect("https://thirsty-allen-2b6ab5.netlify.app/resetPasswordForm");
    //res.send('Email Successfully Verified, Please Log In');
  } else {
    console.log("email is not verified");
    res.end("<h1>Bad Request</h1>");
  }

});

/*------------------------------------------ Reset Password ---------------------------*/
router.patch('/resetPassword', async function (req, res, next) {

  let newPassword = req.body.newPassword;

  try {

    newPassword = await bcrypt.hash(newPassword, 12);

    await User.updateOne({ "username": currentUserName }, { password: newPassword });

    res.json({
      "stat": "200",
      "message": "Successfully reset password"
    });

  } catch (err) {
    console.log(err);
    res.json({
      "stat": "500",
      "message": "Error in resetting password Following"
    });
  }

});

/*------------------------------------------ Send Email For Forgot Password ---------------------------*/
router.post("/forgotPassword", async function (req, res, next) {

  try {

    let { useremail } = req.body;

    let user = await User.findOne({ "email": useremail });

    if (user) {
      let userId = user._id;
      let reset_string = Math.random().toString(36).substr(2, 5);
      let update = await User.findOneAndUpdate({ "email": useremail }, { "reset_token": reset_string });
      let payload = `Reset Your Password here https://thirsty-allen-2b6ab5.netlify.app/reset/${userId}/${reset_string}`;
      let mailOptions = {
        to: useremail,
        subject: "You Requested To Reset Password",
        html: `Reset Your Password here https://thirsty-allen-2b6ab5.netlify.app/reset/${userId}/${reset_string}`
      }
      console.log(mailOptions);
      smtpTransport.sendMail(mailOptions, async function (error, response) {
        if (error) {
          console.log(error);
          return res.json({
            "stat": "200",
            "message": "Error in Sending Forgot Password Mail"
          });
        } else {
          console.log("Message sent: " + response);
          return res.json({
            "stat": "200",
            "message": "Forgot Password Mail Sent,check your email for reset link"
          });
        }
      });
    } else {
      res.json({
        "stat": "500",
        "message": "No user found with this email"
      });
    }

  } catch (err) {
    console.log(err);
    res.json({
      "stat": "500",
      "message": "Error in sending forgot password email"
    });
  }

})

/*------------------------------------------ Verify Forgot Password Email ---------------------------*/
router.get('/reset/:userid/:reset_string', async function (req, res, next) {

  try {

    var ObjectId = require('mongoose').Types.ObjectId;

    let user = await User.findOne({ _id: new ObjectId(req.params.userid.toString()) });

    if (user) {

      let userEmail = user.email;

      if (user.reset_token == req.params.reset_string) {
        console.log(" reset Token is a match");
        res.json({
          "message": "Valid RESET URL",
          "email": userEmail
        });
      } else {
        console.log(" reset Token not match");
        res.json({
          "stat": "500",
          "message": "Invalid URL"
        })
      }

    } else {
      console.log(" user not found");
      res.json({
        "stat": "500",
        "message": "Invalid URL"
      });
    }

  } catch (err) {
    console.log(err);
    res.json({
      "stat": "500",
      "message": "Error in verifying forgot password email"
    });
  }

});

/*------------------------------------------ Reset the new password ---------------------------*/
router.post('/reset', async function (req, res, next) {

  try {

    let { email, password } = req.body;

    let user = await User.findOne({ "email": email });

    if (user) {
      password = await bcrypt.hash(password, 12);
      let setpass = await User.updateOne({ email }, { $set: { password } });
      let remove_token = await User.updateOne({ email }, { $unset: { reset_token: 1 } });

      console.log("Password reset complete");
      res.json({
        "stat": "200",
        "message": "Password reset complete"
      });
    } else {
      console.log("No user found with this email");
      res.json({
        "stat": "500",
        "message": "No user found with this email"
      });
    }

  } catch (err) {
    console.log(err);
    res.json({
      "stat": "500",
      "message": "Error in resetting passord"
    });
  }

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

/*
router.get('/forgotpassword', function (req, res) {

  res.send('<form action="/passwordreset" method="POST">' +
    '<input type="email" name="email" value="" placeholder="Enter your email address..." />' +
    '<input type="submit" value="Reset Password" />' +
    '</form>');

});

router.post('/passwordreset', function (req, res) {
  if (req.body.email !== undefined) {
    var emailAddress = req.body.email;

    // TODO: Using email, find user from your database.
    var currentUser = await User.findOne({ "email": emailAddress });
    var payload = {
      id: currentUser._id,        // User ID from database
      email: emailAddress
    };

    // TODO: Make this a one-time-use token by using the user's
    // current password hash from the database, and combine it
    // with the user's created date to make a very unique secret key!
    // For example:
    // var secret = user.password + ‘-' + user.created.getTime();
   
    //var secret = 'fe1a1915a379f3be5394b64d14794932-1506868106675';
    var secret = currentUser.password + "-" + currentUser.createdAt;

    var token = jwt.encode(payload, secret);

    // TODO: Send email containing link to reset password.
    // In our case, will just return a link to click.
    res.send('<a href="/resetpassword/' + payload.id + '/' + token + '">Reset password</a>');
    // Send email containing reset password link
    host = "cps-sma-umesh.herokuapp.com"
    link = "https://" + host + "/resetpassword/" + payload.id + '/' + token;
    mailOptions = {
      to: email,
      subject: "You Have Requested To Reset Your Password",
      html: "Hello,<br> Please Click on the link to rest your password.<br><a href=" + link + ">Click here to Reset</a>"
    }
    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, async function (error, response) {
      if (error) {
        console.log(error);
        return res.json({
          "message": "Error in Sending Verification Mail"
        });
      } else {
        console.log("Message sent: " + response.message);

        return res.json({
          "stat": "200",
          "message": "Verification Mail Sent,Please Verify"
        });

      }
    });
  } else {
    res.send('Email address is missing.');
  }
});

router.get('/resetpassword/:id/:token', function (req, res) {
  // TODO: Fetch user from database using
  // req.params.id
  var currentUser = await User.findOne({ _id: req.params.id });
  // TODO: Decrypt one-time-use token using the user's
  // current password hash from the database and combine it
  // with the user's created date to make a very unique secret key!
  // For example,
  // var secret = user.password + ‘-' + user.created.getTime();
  //var secret = 'fe1a1915a379f3be5394b64d14794932-1506868106675';
  var secret = currentUser.password + '-' + currentUser.createdAt;
  var payload = jwt.decode(req.params.token, secret);

  // TODO: Gracefully handle decoding issues.
  // Create form to reset password.
  res.send('<form action="/resetpassword" method="POST">' +
    '<input type="hidden" name="id" value="' + payload.id + '" />' +
    '<input type="hidden" name="token" value="' + req.params.token + '" />' +
    '<input type="password" name="password" value="" placeholder="Enter your new password..." />' +
    '<input type="submit" value="Reset Password" />' +
    '</form>');
});


router.post('/resetpassword', function (req, res) {
  // TODO: Fetch user from database using
  // req.body.id

  // TODO: Decrypt one-time-use token using the user's
  // current password hash from the database and combining it
  // with the user's created date to make a very unique secret key!
  // For example,
  // var secret = user.password + ‘-' + user.created.getTime();
  var secret = 'fe1a1915a379f3be5394b64d14794932-1506868106675';

  var payload = jwt.decode(req.body.token, secret);

  // TODO: Gracefully handle decoding issues.
  // TODO: Hash password from
  // req.body.password
  res.send('Your password has been successfully changed.');
});
*/


module.exports = router;

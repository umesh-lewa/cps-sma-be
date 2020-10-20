var express = require('express');
var router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('hello from posts');
});

/*------------------------------------------ Add Post ---------------------------*/
router.post('/addPost',async function (req, res, next) {

  const postBody = req.body.postBody;
  const postUserEmail = req.body.postUserEmail;

  const newPost = new Post({
    "body": postBody,
    username,
    "useremail": postUserEmail,
    createdAt: new Date().toISOString()
  });

  const savePostResponse = await newPost.save();

  res.json({
    "stat": "200",
    "message": "Succeccfully Add Post",
  });

});

/*------------------------------------------ Get Posts For User ---------------------------*/
router.get('/getPosts/:useremail',async function (req, res, next) {

  const useremail = req.params.useremail;

  let userPosts = [];
  let followingPosts = [];

  const postsOfuser = Post.find({ "useremail": useremail }, function (err, docs) {
    if (err) {
      console.log(err);
    }
    else {
      console.log("got posts of the user");
      userPosts = docs;
    }
  });

  const user = await User.findOne({ "email": useremail });

  let following = user.following;

  following.forEach((eachFollowing) => {

    let followingUser = Post.find({ "useremail": eachFollowing }, function (err, docs) {
      let followingUserPosts = Post.find({ "user": eachFollowing });

      if (err) {
        console.log(err);
      }
      else {
        console.log("First function call : ", docs);
        userPosts = docs;
      }
    });

    followingPosts.push();
  });

  userPosts = [...userPosts, ...followingPosts];

  res.json({
    "stat": "200",
    "message": "Succeccfully Fetched Posts",
    "posts": userPosts
  });

});

/*------------------------------------------ Edit Comment ---------------------------*/
router.patch('/editPost/',async function (req, res, next) {

  const postId = req.params.postId;
  const postBody = req.params.postBody;

  const updatePost = Post.findByIdAndUpdate( postId, { body: postBody },
    function (err, docs) {
      if (err) {
        console.log(err);
      }
      else {
        console.log("Updated User : ", docs);
        res.json({
          "stat": "200",
          "message": "Successfully Updated Post"
        })
      }
    });
});

/*------------------------------------------ Delete Comment ---------------------------*/
router.delete('/deletePost/', function (req, res, next) {

  const postId = req.params.postId;

  const deletePost = Post.deleteOne({ _id: postId });

});

/*------------------------------------------ Add Comment ---------------------------*/
router.post('/addComment', function (req, res, next) {
  res.send('hello from posts');
});

router.delete('/removeComment', function (req, res, next) {
  res.send('hello from posts');
});

/*------------------------------------------ Add Like ---------------------------*/
router.post('/addLike', function (req, res, next) {
  res.send('hello from posts');
});

router.delete('/removeLike', function (req, res, next) {
  res.send('hello from posts');
});

module.exports = router;
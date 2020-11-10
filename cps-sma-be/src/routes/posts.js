var express = require('express');
var router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const { Mongoose } = require('mongoose');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('hello from posts');
});

/*------------------------------------------ Add Post ---------------------------*/
router.post('/addPost', async function (req, res, next) {

  const postBody = req.body.postBody;
  const postUserEmail = req.body.postUserEmail;

  const user = await User.findOne({ "email": postUserEmail });

  console.log("username : " + user.username);

  const newPost = new Post({
    "body": postBody,
    "username": user.username,
    "useremail": postUserEmail,
    createdAt: new Date().toISOString(),
    "user": user._id
  });

  const savePostResponse = await newPost.save();

  res.json({
    "stat": "200",
    "message": "Successfully Added Post",
  });

});

/*------------------------------------------ Get Posts For User ---------------------------*/
router.get('/getPosts/:useremail', async function (req, res, next) {

  const useremail = req.params.useremail;

  console.log("useremail : " + useremail);

  try {

    let userPosts = [];
    let followingPosts = [];

    const postsOfuser = await Post.find({ "useremail": useremail }, function (err, docs) {
      if (err) {
        console.log(err);
      }
      else {
        console.log("got posts of the user");
        userPosts = docs;
      }
    });

    console.log("userPosts : " + userPosts);


    const user = await User.findOne({ "email": useremail });
    console.log("user : " + user);

    let temp = JSON.stringify(user);

    console.log("temp : " + temp);

    temp = JSON.parse(temp);

    console.log("temp : " + temp);

    let following = temp.following;

    //.toString().split(",").join("")
    console.log("following : " + following);
    console.log(following.toString());
    console.log(following.toString().split(","));

    let followingUsersArray = following.toString().split(",");

    var ObjectId = require('mongoose').Types.ObjectId;

    var eachFollowinguserPosts = [];

    console.log("user.followingCount : " + user.followingCount);

    // user and following posts array for empty
    if (user.followingCount != 0) {

      for (let i = 0; i < followingUsersArray.length; i++) {

        console.log("followingUsersArray[i] : " + followingUsersArray[i]);

        let followingUserPosts = await Post.find({ "user": new ObjectId(followingUsersArray[i].toString()) }, function (err, docs) {
          if (err) {
            console.log(err);
          } else {
            console.log("got posts of following user");
            
            console.log("docs : " + docs);
            console.log("docs.length : " + docs.length);

            if (docs.length == 1) {
              eachFollowinguserPosts.length = 0;
              eachFollowinguserPosts.push(docs[0]);
              console.log("eachFollowinguserPosts : " + eachFollowinguserPosts);
            } else {
              eachFollowinguserPosts = docs;
            }

            console.log("typeof (docs) : " + typeof (docs));
          }
        });

        console.log("eachFollowinguserPosts : " + eachFollowinguserPosts);
        followingPosts.push(...eachFollowinguserPosts);
      }

    }



    // followingUsersArray.forEach((eachFollowing) => {

    //   let followingUserPosts = Post.find({ user: eachFollowing });

    //   followingPosts.push(...followingUserPosts);
    // });

    console.log("followingPosts : " + followingPosts);

    //userPosts = [...userPosts, ...followingPosts];

    res.json({
      "stat": "200",
      "message": "Successfully Fetched Posts",
      //"posts": userPosts
      "userPosts": userPosts,
      "followingPosts": followingPosts
    });

  } catch (err) {
    console.log(err);
    res.json({
      "stat": "500",
      "message": "Error in fetching posts"
    });
  }

});

/*------------------------------------------ Get Single Post Details ---------------------------*/
router.get('/getPost/:postId', async function (req, res, next) {

  const postId = req.params.postId;

  console.log("postId : " + postId);

  try {

    var ObjectId = require('mongoose').Types.ObjectId;

    let singlePost = await Post.findOne({ _id: new ObjectId(postId.toString()) });

    console.log("singlePost : " + singlePost);

    res.json({
      "stat": "200",
      "message": "Successfully Fetched Single Post",
      "post": singlePost,
    });

  } catch (err) {
    console.log(err);
    res.json({
      "stat": "500",
      "message": "Error in fetching single post"
    });
  }

});

/*------------------------------------------ Edit Post ---------------------------*/
router.patch('/editPost', async function (req, res, next) {

  const postId = req.params.postId;
  const postBody = req.params.postBody;

  const updatePost = Post.findByIdAndUpdate(postId, { body: postBody },
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

/*------------------------------------------ Delete Post ---------------------------*/
router.delete('/deletePost', async function (req, res, next) {

  const postId = req.body.postId;

  try {

    const deletePost = await Post.deleteOne({ _id: postId });
    // TODO remove post from posts array in user, currentlynot adding postto user during addPost
    res.json({
      "stat": "200",
      "message": "Successfully deleted post"
    });

  } catch (err) {
    console.log(err);
    res.json({
      "stat": "500",
      "message": "Error in deleting post"
    });
  }

});

/*------------------------------------------ Add Comment ---------------------------*/
router.post('/addComment', async function (req, res, next) {

  const postId = req.body.postId;
  const commentBody = req.body.commentBody;
  const useremail = req.body.useremail;

  try {

    let user = await User.findOne({ "email": useremail });
    await Post.updateOne({ _id: postId }, { $push: { comments: { "body": commentBody, "username": user.username, "useremail": useremail, createdAt: new Date().toISOString() } } });

    res.json({
      "stat": "200",
      "message": "Successfully added comment for post"
    });

  } catch (err) {
    console.log(err);
    res.json({
      "stat": "500",
      "message": "Error in adding comment for post"
    });
  }

});

/*------------------------------------------ Remove Comment ---------------------------*/
router.delete('/removeComment', async function (req, res, next) {

  const postId = req.body.postId;
  const commentId = req.body.commentId;
  const useremail = req.body.useremail;

  try {
    // Remove comment with specific field/fields 5f929d270ee32857ccdf357a
    await Post.updateOne({ _id: postId }, { $pull: { comments: { _id: commentId } } });

    res.json({
      "stat": "200",
      "message": "Successfully removed comment for post"
    });

  } catch (err) {
    console.log(err);
    res.json({
      "stat": "500",
      "message": "Error in removing comment for post"
    });
  }

});

/*------------------------------------------ Add Like ---------------------------*/
router.post('/addLike', async function (req, res, next) {

  const postId = req.body.postId;
  const useremail = req.body.useremail;

  try {

    let user = await User.findOne({ "email": useremail });

    await Post.updateOne({ _id: postId }, { $push: { likes: { "username": user.username, "useremail": useremail, createdAt: new Date().toISOString() } } });

    res.json({
      "stat": "200",
      "message": "Successfully added like for post"
    });

  } catch (err) {
    console.log(err);
    res.json({
      "stat": "500",
      "message": "Error in adding like for post"
    });
  }

});

/*------------------------------------------ Remove Like ---------------------------*/
router.delete('/removeLike', async function (req, res, next) {

  const postId = req.body.postId;
  const useremail = req.body.useremail;

  try {

    await Post.updateOne({ _id: postId }, { $pull: { likes: { "useremail": useremail } } });

    res.json({
      "stat": "200",
      "message": "Successfully removed like for post"
    });

  } catch (err) {
    console.log(err);
    res.json({
      "stat": "500",
      "message": "Error in removing like for post"
    });
  }

});

module.exports = router;
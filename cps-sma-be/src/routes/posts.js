var express = require('express');
var router = express.Router();

/* GET posts listing. */
router.get('/', function(req, res, next) {
  res.send('hello from posts');
});

/*------------------------------------------ Add Post ---------------------------*/
router.post('/addPost', function(req, res, next) {
  res.send('hello from posts');
});

/*------------------------------------------ Get Posts For User ---------------------------*/
router.get('/getPosts/:username', function(req, res, next) {
  res.send('hello from posts');
});

router.put('/editPost/:postId', function(req, res, next) {
  res.send('hello from posts');
});

/*------------------------------------------ Add Comment ---------------------------*/
router.post('/addComment', function(req, res, next) {
  res.send('hello from posts');
});

router.delete('/removeComment', function(req, res, next) {
  res.send('hello from posts');
});

module.exports = router;
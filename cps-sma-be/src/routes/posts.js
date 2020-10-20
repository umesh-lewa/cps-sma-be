var express = require('express');
var router = express.Router();

/* GET posts listing. */
router.get('/', function(req, res, next) {
  res.send('hello from posts');
});

module.exports = router;
var express = require('express');
var router = express.Router();

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

module.exports = router;

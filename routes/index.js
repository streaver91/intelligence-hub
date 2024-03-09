const express = require('express');

const user = require('./user');

const router = express.Router();

router.get('/', (request, response) => {
  if (user.getUserFromRequest(request, response) === null) {
    response.redirect('/user/sign_in');
    return;
  }
  response.render('index/index');
});

module.exports = router;

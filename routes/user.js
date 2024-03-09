const express = require('express');

const utils = require('./utils');

const USER = {
  EMAIL: process.env.USER_EMAIL,
  PASSWORD: process.env.USER_PASSWORD,
};

const STORAGE_KEY = {
  EMAIL: 'user.email',
  PASSWORD: 'user.password',
};

const COOKIE_OPTIONS = {
  signed: true,
  maxAge: 1000 * 86400 * 30,
};

const router = express.Router();

const getUserFromSession = (request, response) => {
  if (!request.session) {
    return null;
  }
  const email = request.session[STORAGE_KEY.EMAIL];
  const password = request.session[STORAGE_KEY.PASSWORD];
  if (email !== USER.EMAIL || password !== USER.PASSWORD) {
    return null;
  }
  return USER;
};

const getUserFromCookie = (request, response) => {
  const email = request.signedCookies[STORAGE_KEY.EMAIL];
  const password = request.signedCookies[STORAGE_KEY.PASSWORD];
  if (email !== USER.EMAIL || password !== USER.PASSWORD) {
    return null;
  }
  return USER;
};

const getUserFromRequest = (request, response) => {
  return getUserFromSession(request, response) || getUserFromCookie(request, response);
};

router.get('/sign_in', (request, response) => {
  if (getUserFromRequest(request, response) !== null) {
    response.redirect('/');
    return;
  }
  response.render('user/sign_in');
});

router.post('/sign_in', (request, response) => {
  const email = request.body.email;
  const password = request.body.password;

  if (email !== USER.EMAIL) {
    utils.sendFailure({ email: 'Incorrect email.' }, response);
    return;
  }
  if (password !== USER.PASSWORD) {
    utils.sendFailure({ password: 'Incorrect password.' }, response);
    return;
  }

  request.session = request.session || {};
  request.session[STORAGE_KEY.EMAIL] = email;
  request.session[STORAGE_KEY.PASSWORD] = password;
  if (request.body.keep) {
    response.cookie(STORAGE_KEY.EMAIL, email, COOKIE_OPTIONS);
    response.cookie(STORAGE_KEY.PASSWORD, password, COOKIE_OPTIONS);
  }

  utils.sendSuccess({}, response, '/');
});

module.exports = router;
module.exports.getUserFromRequest = getUserFromRequest;

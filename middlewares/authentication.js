const reqlib = require('app-root-path').require;
const config = require('config');
const basicAuth = require('express-basic-auth');

const { unauthorized } = reqlib('/errors/errors');

const { username, password } = config.authentication;
const authentication = basicAuth({
  users: { [username]: password },
  unauthorizedResponse: unauthorized,
});

module.exports = { authentication };

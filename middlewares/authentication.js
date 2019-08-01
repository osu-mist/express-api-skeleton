const appRoot = require('app-root-path');
const config = require('config');
const basicAuth = require('express-basic-auth');

const { unauthorized } = appRoot.require('errors/errors');

const { username, password } = config.authentication;

/** The middleware for basicAuth */
const authentication = basicAuth({
  users: { [username]: password },
  unauthorizedResponse: unauthorized,
});

module.exports = { authentication };

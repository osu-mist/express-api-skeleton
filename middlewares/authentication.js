const reqlib = require('app-root-path').require;
const config = require('config');
const basicAuth = require('express-basic-auth');

const { unauthorized } = reqlib('/errors/errors');

const { username, password } = config.authentication;

/**
 * @summary Return a basicAuth middleware
 * @param {Object} config Configuration
 * @returns {Object} BasicAuth middleware
 */
const authentication = basicAuth({
  users: { [username]: password },
  unauthorizedResponse: unauthorized,
});

module.exports = { authentication };

import config from 'config';
import basicAuth from 'express-basic-auth';

import unauthorized from 'Errors/errors';

const { username, password } = config.authentication;

/**
 * @summary The middleware for basicAuth
 */
const authentication = basicAuth({
  users: { [username]: password },
  unauthorizedResponse: unauthorized,
});

export { authentication as default };

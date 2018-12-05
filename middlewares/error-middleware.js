const appRoot = require('app-root-path');
const _ = require('lodash');

const { errorBuilder, errorHandler } = appRoot.require('errors/errors');

/**
 * @summary The middleware for handling errors
 */
const errorMiddleware = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const { status, errors } = err;

  /**
   * express-openapi validates requests based on openapi specification. For example, if we specify
   * the maximum of page[size] is 500 in openapi.yaml, then it'll return a 400 error if page[size]
   * is exceeded the maximum. This logic is mainly to serialize the error by adhering to JSON API.
   */
  if (status === 400) {
    const details = [];
    _.forEach(errors, (error) => {
      const pathQueryRegex = /\['(.*)'\]/g;
      const { path, message, location } = error;
      details.push(`${location} '${pathQueryRegex.exec(path)[1]}' ${message}`);
    });
    errorBuilder(res, 400, details);
  } else {
    errorHandler(res, err);
  }
};

module.exports = { errorMiddleware };

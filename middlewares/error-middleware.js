const appRoot = require('app-root-path');
const _ = require('lodash');

const { openapi } = appRoot.require('utils/load-openapi');
const { errorBuilder, errorHandler } = appRoot.require('errors/errors');

/**
 * @summary The middleware for handling errors
 */
const errorMiddleware = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const { status, errors } = err;

  /**
   * express-openapi will add a leading '[' and closing ']' to the 'path' field if the parameter
   * name contains '[' or ']'. This regex will match these incorrectly formatted paths so that they
   * can be normalized.
   * @type {RegExp}
   */
  const badFormatPathRegex = /\['(.*)']/g;

  /**
   * express-openapi validates requests based on openapi specification. For example, if we specify
   * the maximum of page[size] is 500 in openapi.yaml, then it'll return a 400 error if page[size]
   * is exceeded the maximum. This logic is mainly to serialize the error by adhering to JSON API.
   */
  if (status === 400) {
    const details = [];
    _.forEach(errors, (error) => {
      const {
        path, errorCode, message, location,
      } = error;
      const regexResult = badFormatPathRegex.exec(path);
      const formattedPath = regexResult ? regexResult[1] : path;

      if (errorCode === 'enum.openapi.validation') {
        let param = _.find(
          openapi.paths[req.path][req.method.toLowerCase()].parameters,
          it => it.name === path,
        );
        if (!param) {
          param = openapi.parameters[path];
        }
        details.push(`${path} must be one of ['${param.enum.join("', '")}']`);
      } else {
        details.push(`Error in path: '${formattedPath}', location: ${location},`
          + ` message: ${message}`);
      }
    });
    errorBuilder(res, 400, details);
  } else {
    errorHandler(res, err);
  }
};

module.exports = { errorMiddleware };

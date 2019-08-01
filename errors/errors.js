const JsonApiError = require('jsonapi-serializer').Error;
const _ = require('lodash');

const { logger } = require('../utils/logger');

/**
 * Construct error object
 *
 * @param {string} status The HTTP status code
 * @param {string} title A short, human-readable summary of the problem
 * @param {string} code An application-specific error code
 * @param {string} detail A human-readable explanation
 * @returns {object} An error object
 */
const error = (status, title, code, detail) => ({
  status,
  title,
  code,
  detail,
  links: { about: `https://developer.oregonstate.edu/documentation/error-reference#${code}` },
});

/**
 * [400] Return a Bad Request error object
 *
 * @param {string[]} details An array of bad request details
 * @returns {object} Bad Request error object
 */
const badRequest = (details) => {
  const badRequests = [];
  _.forEach(details, detail => badRequests.push(error(
    '400',
    'Bad Request',
    '1400',
    detail,
  )));
  return new JsonApiError(badRequests);
};

/**
 * [401] Return a Unauthorized error object
 *
 * @returns {object} Unauthorized error object
 */
const unauthorized = () => new JsonApiError(error(
  '401',
  'Unauthorized',
  '1401',
  'Credentials are invalid',
));

/**
 * [403] Return a Forbidden error object
 *
 * @param {string} detail A human-readable explanation
 * @returns {object} Unauthorized error object
 */
const forbidden = detail => new JsonApiError(error(
  '403',
  'Forbidden',
  '1403',
  detail,
));

/**
 * [404] Return a Not Found error object
 *
 * @param {string} detail A human-readable explanation
 * @returns {object} Not Found error object
 */
const notFound = detail => new JsonApiError(error(
  '404',
  'Not found',
  '1404',
  detail,
));

/**
 * [409] Return a Conflict error object
 *
 * @param {string} detail A human-readable explanation
 * @returns {object} Conflict error object
 */
const conflict = detail => new JsonApiError(error(
  '409',
  'Conflict',
  '1409',
  detail,
));

/**
 * [500] Return a Internal Server Error error object
 *
 * @param {string} detail A human-readable explanation
 * @returns {object} Internal Server Error error object
 */
const internalServerError = detail => new JsonApiError(error(
  '500',
  'Internal Server Error',
  '1500',
  detail,
));

/**
 * Function to build an error response
 *
 * @param {Response} res Response
 * @param {string} status The HTTP status code
 * @param {string|string[]} detail A human-readable explanation
 */
const errorBuilder = (res, status, detail) => {
  const errorDictionary = {
    400: badRequest(detail),
    410: unauthorized(),
    403: forbidden(detail),
    404: notFound(detail),
    409: conflict(detail),
  };
  res.status(status).send(errorDictionary[status]);
};

/**
 * Function to handle unexpected errors
 *
 * @param {Response} res Response
 * @param {object} err Error
 */
const errorHandler = (res, err) => {
  const detail = 'The application encountered an unexpected condition.';
  // Not all errors will have a stack associated with it
  let message = err.stack || err;
  if (_.isObject(message)) {
    try {
      message = JSON.stringify(message);
    } catch (ex) {
      logger.error(`Could not stringify error. Exception: ${ex}`);
    }
  }
  logger.error(message);
  res.status(500).send(internalServerError(detail));
};

module.exports = {
  unauthorized,
  errorBuilder,
  errorHandler,
};

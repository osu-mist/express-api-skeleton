const JSONAPIError = require('jsonapi-serializer').Error;

/**
 * @summary Return a JSON API error object
 * @function
 * @param {string} status status
 * @param {string} title title
 * @param {string} description description
 * @returns {Object} JSON API error object
 */
const error = (status, title, description) => new JSONAPIError({
  status,
  title,
  detail: description,
});

/**
 * @summary Return a Bad Request error object
 * @function
 * @param {string} description
 * @returns {Object} Bad Rquest error object
 */
const badRequest = description => error(400, 'Bad request', description);

/**
 * @summary Return a Unauthorized error object
 * @returns {Object} Unauthorized error object
 */
const unauthorized = () => error(401, 'Unauthorized', 'Unauthorized');

/**
 * @summary Return a Not Found error object
 * @function
 * @param {string} description
 * @returns {Object} Not Found error object
 */
const notFound = description => error(404, 'Not found', description);

/**
 * @summary Return a Internal Server Error error object
 * @function
 * @param {string} description
 * @returns {Object} Internal Server Error error object
 */
const internalServerError = description => error(500, 'Internal Server Error', description);

/**
 * @summary Function to handle unexpected errors
 * @function
 * @param res response
 * @param err error
 */
const errorHandler = (res, err) => {
  const description = 'The application encountered an unexpected condition.';
  console.error(err.stack);
  res.status(500).send(internalServerError(description));
};

module.exports = {
  badRequest,
  unauthorized,
  notFound,
  errorHandler,
};

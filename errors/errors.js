const JSONAPIError = require('jsonapi-serializer').Error;

// JSON API Error Object
const error = (status, title, description) => new JSONAPIError({
  status,
  title,
  detail: description,
});

const badRequest = description => error(400, 'Bad request', description);
const unauthorized = () => error(401, 'Unauthorized', 'Unauthorized');
const notFound = description => error(404, 'Not found', description);
const internalServerError = description => error(500, 'Internal Server Error', description);

const errorHandler = (res, err) => {
  console.error(err.stack);
  res.status(500).send(internalServerError('The application encountered an unexpected condition.'));
};

module.exports = {
  badRequest,
  unauthorized,
  notFound,
  errorHandler,
};

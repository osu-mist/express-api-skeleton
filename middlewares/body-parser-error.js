/**
 * Middleware that improves the error message when failing to parse JSON
 *
 * @type {ErrorRequestHandler}
 */
const bodyParserError = (err, req, res, next) => {
  if (err instanceof SyntaxError) {
    err.customStatus = 400;
    err.customMessage = `Error parsing JSON: ${err}`;
  }
  next(err);
};

module.exports = { bodyParserError };

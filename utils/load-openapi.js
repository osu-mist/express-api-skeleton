const deasync = require('deasync');
const SwaggerParser = require('swagger-parser');

/**
 * @summary Wrap async parser in a synchronous function. Preserve "this" context.
 * @function
 * @throws Error if Promise is rejected
 */
const validateSync = deasync(SwaggerParser.validate).bind(SwaggerParser);

/**
 * @summary Attempt to parse openapi.yaml and log error and exit if error is thrown
 * @function
 */
const parseOpenApi = () => {
  try {
    return validateSync('openapi.yaml');
  } catch (err) {
    console.error(err);
    return process.exit(1);
  }
};

const openapi = parseOpenApi();

module.exports = { openapi };

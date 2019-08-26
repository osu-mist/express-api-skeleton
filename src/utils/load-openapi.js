import deasync from 'deasync';
import SwaggerParser from 'swagger-parser';

import { logger } from 'utils/logger';

/**
 * Wrap async parser in a synchronous function. Preserve "this" context.
 *
 * @throws Error if Promise is rejected
 */
const validateSync = deasync(SwaggerParser.validate).bind(SwaggerParser);

/**
 * Attempt to parse openapi.yaml and log error and exit if error is thrown
 *
 * @returns {object} The parsed openapi document
 */
const parseOpenApi = () => {
  try {
    return validateSync('openapi.yaml');
  } catch (err) {
    logger.error(err);
    return process.exit(1);
  }
};

const openapi = parseOpenApi();

export { openapi };

import expressWinston from 'express-winston';

import { logger } from '../utils/logger';

// log the request body
expressWinston.requestWhitelist.push('body');

/** The logger middleware for API requests/responses */
const loggerMiddleware = expressWinston.logger({
  winstonInstance: logger,
  // The logging level that API messages will be logged to
  level: 'api',
  expressFormat: true,
  colorize: true,
});

export { loggerMiddleware };

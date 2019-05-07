import config from 'config';
import expressWinston from 'express-winston';
import winston from 'winston';
import 'winston-daily-rotate-file';

import { name } from 'package.json';

const loggerConfig = config.get('logger');

/**
 * @summary Return a transport for daily rotate file
 * @returns A transport for daily rotate file
 */
const dailyRotateFileTransport = new (winston.transports.DailyRotateFile)({
  filename: `${name}-%DATE%.log`,
  datePattern: loggerConfig.pattern,
  maxSize: loggerConfig.size,
  zippedArchive: loggerConfig.archive,
  dirname: loggerConfig.path,
});

/**
 * @summary Return a transport for console output
 * @returns A transport for daily rotate file
 */
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.simple(),
  ),
});

/**
 * @summary The middleware for logger
 */
const logger = expressWinston.logger({
  transports: [dailyRotateFileTransport, consoleTransport],
  expressFormat: true,
});

export { logger as default };

const appRoot = require('app-root-path');
const config = require('config');
const expressWinston = require('express-winston');
const winston = require('winston');
require('winston-daily-rotate-file');

const { name } = appRoot.require('package');

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

module.exports = { logger };

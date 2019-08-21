const appRoot = require('app-root-path');
const _ = require('lodash');
const winston = require('winston');
require('winston-daily-rotate-file');

const { name } = appRoot.require('package');

const customLevels = {
  /**
   * A lower number means higher priority. Each logger level will include all other levels with a
   * lower number.
   */
  levels: {
    error: 0,
    warn: 1,
    api: 2,
    info: 3,
    debug: 4,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    api: 'cyan',
    info: 'green',
    debug: 'magenta',
  },
};

winston.addColors(customLevels.colors);

/** A transport for daily rotate file */
const dailyRotateFileTransport = new (winston.transports.DailyRotateFile)({
  filename: `${name}-%DATE%.log`,
  maxSize: '10m',
  dirname: 'logs',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
});

/** A transport for console output */
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf((msg) => {
      const { timestamp, level, message } = msg;

      /**
       * These fields will be printed in the initial simple message, so they don't need to be
       * included again
       */
      const strippedItems = [
        'level',
        'message',
        'timestamp',
        'meta.responseTime',
        'meta.req.httpVersion',
        'meta.req.method',
        'meta.req.url',
        'meta.res.statusCode',
      ];

      const simpleMessage = _(msg)
        .omit(strippedItems)
        .thru(obj => (_.isEmpty(obj) ? '' : ` ${JSON.stringify(obj)}`))
        .value();
      return `${timestamp} - ${level}: ${message}${simpleMessage}`;
    }),
  ),
});

/**
 * The logger instance
 *
 * @example
 * // Logs 'message' to the info level
 * logger.info('message');
 * @example
 * // Logs 'encountered error' to the error level
 * logger.error('encountered error');
 */
const logger = winston.createLogger({
  transports: [dailyRotateFileTransport, consoleTransport],
  /** The maximum logging level of messages that the logger will log */
  level: 'debug',
  levels: customLevels.levels,
});

module.exports = { logger };

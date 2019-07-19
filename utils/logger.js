const appRoot = require('app-root-path');
const config = require('config');
const expressWinston = require('express-winston');
const _ = require('lodash');
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
    winston.format.printf((msg) => {
      const { timestamp, level, message } = msg;

      /* These fields will be printed in the initial simple message, so they don't need to be
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

      /**
       * Filters an object by removing key-value pairs with values that are empty objects
       *
       * @param {Object} obj The object to be filtered
       * @returns {Object} The filtered object
       */
      const removeEmpties = obj => _(obj)
        .mapValues(val => (_.isObject(val) ? removeEmpties(val) : val))
        .omitBy(_.isEmpty)
        .value();

      const simpleMessage = _(msg)
        .omit(strippedItems)
        .thru(removeEmpties)
        .thru(obj => (_.isEmpty(obj) ? '' : ` ${JSON.stringify(obj)}`))
        .value();
      return `${timestamp} - ${level}: ${message}${simpleMessage}`;
    }),
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

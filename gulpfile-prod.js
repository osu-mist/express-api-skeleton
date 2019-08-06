const forever = require('forever-monitor');

/**
 * @summary Start application using forever
 */
const start = () => new forever.Monitor('dist/app.js').start();

module.exports = {
  start,
};

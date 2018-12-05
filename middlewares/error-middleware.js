const appRoot = require('app-root-path');
const _ = require('lodash');

const { errorBuilder, errorHandler } = appRoot.require('errors/errors');

const errorMiddleware = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const { status, errors } = err;

  if (status === 400) {
    const details = [];
    _.forEach(errors, (error) => {
      const pathQueryRegex = /\['(.*)'\]/g;
      const { path, message, location } = error;
      details.push(`${location} '${pathQueryRegex.exec(path)[1]}' ${message}`);
    });
    errorBuilder(res, 400, details);
  } else {
    errorHandler(res, err);
  }
};

module.exports = { errorMiddleware };

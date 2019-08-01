const appRoot = require('app-root-path');
const composeErrors = require('compose-middleware').errors;
const _ = require('lodash');

const { errorBuilder, errorHandler } = appRoot.require('errors/errors');
const { logger } = appRoot.require('utils/logger');

/**
 * Determines if an error is an OpenAPI error
 *
 * @param {object} err Error object
 * @returns {boolean} Whether the error is an OpenAPI error or not
 */
const isOpenApiError = err => (
  _.has(err, 'errors') && _.every(err.errors, it => _.includes(it.errorCode, 'openapi'))
);

/**
 * The middleware for handling custom openapi errors
 *
 * @type {ErrorRequestHandler}
 */
const customOpenApiError = (err, req, res, next) => {
  // call the next middleware function if the error is not an openapi error
  if (!isOpenApiError(err)) {
    return next(err);
  }
  /**
   * @todo Implement custom OpenAPI error rules and handlers here.
   */
  return next(err);
};

/**
 * The middleware for handling general openapi errors
 *
 * @type {ErrorRequestHandler}
 */
const openApiError = (err, req, res, next) => {
  // call the next middleware function if the error is not an openapi error
  if (!isOpenApiError(err)) {
    return next(err);
  }

  /**
   * Generate message for illegal value of enum
   *
   * @param {object} error The error object
   * @returns {string} The enum message
   */
  const enumErrorMessage = error => (
    `${error.path} must be one of ['${error.params.allowedValues.join("', '")}']`
  );

  const { status, errors } = err;

  if (status === 400) {
    const details = err.details || [];

    // Return 409 if type is invalid
    const invalidTypeError = _.find(errors, error => (
      error.path === 'data.type' && error.errorCode === 'enum.openapi.validation'
    ));
    if (invalidTypeError) {
      return errorBuilder(res, 409, enumErrorMessage(invalidTypeError));
    }

    // Return 404 if error is pattern validation and in path
    const invalidPatternError = _.find(errors, error => (
      error.errorCode === 'pattern.openapi.validation' && error.location === 'path'
    ));
    if (invalidPatternError) {
      return errorBuilder(
        res,
        404,
        `'${invalidPatternError.path}' in path ${invalidPatternError.message}`,
      );
    }

    _.forEach(errors, (error) => {
      const {
        path,
        errorCode,
        message,
        location,
      } = error;

      if (errorCode === 'enum.openapi.validation') {
        details.push(enumErrorMessage(error));
      } else if (errorCode === 'additionalProperties.openapi.validation') {
        const { additionalProperty } = error.params;
        details.push(`Unrecognized property '${additionalProperty}' in path: '${path}', location: '${location}'`);
      } else {
        details.push(`Error in path: '${path}', location: '${location}', message: '${message}'`);
      }
    });
    return errorBuilder(res, 400, details);
  }
  return errorHandler(res, err);
};

/**
 * The middleware for handling generic errors
 *
 * @type {ErrorRequestHandler}
 */
const genericError = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const status = _.has(err, 'customStatus') ? err.customStatus : 500;
  let detail = _.has(err, 'customMessage') ? err.customMessage : null;
  detail = status === 400 ? [detail] : detail;

  if (status === 500) {
    if (detail) {
      logger.error(detail);
    }
    errorHandler(res, err);
  } else {
    errorBuilder(res, status, detail);
  }
};

const runtimeErrors = composeErrors([
  customOpenApiError,
  openApiError,
  genericError,
]);

module.exports = { runtimeErrors };

/* eslint no-console: ["error", { allow: ["warn"] }] */

import { errorHandler } from 'errors/errors';

/**
 * Middleware that overrides res.send to perform response validation
 *
 * @type {RequestHandler}
 */
const validateAllResponses = (req, res, next) => {
  const strictValidation = req.apiDoc['x-express-openapi-validation-strict'];
  if (typeof res.validateResponse === 'function') {
    const { send } = res;
    res.send = (...args) => {
      const onlyWarn = !strictValidation;
      if (res.get('x-express-openapi-validation-error-for') !== undefined) {
        return send.apply(res, args);
      }
      const body = args[0];
      let validation = res.validateResponse(res.statusCode, body);
      let validationMessage;
      if (validation === undefined) {
        validation = { message: undefined, errors: undefined };
      }
      if (validation.errors) {
        let errors;
        try {
          errors = JSON.stringify(validation.errors, null, 2);
        } catch (err) {
          return errorHandler(res, err);
        }
        validationMessage = `Invalid response for status code ${res.statusCode}: ${errors}`;
        console.warn(validationMessage);
        // Set to avoid a loop, and to provide the original status code
        res.set('x-express-openapi-validation-error-for', res.statusCode.toString());
      }
      if (onlyWarn || !validation.errors) {
        return send.apply(res, args);
      }
      return errorHandler(res, validationMessage);
    };
  }
  next();
};

export { validateAllResponses };

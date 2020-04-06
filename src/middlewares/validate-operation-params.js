import _ from 'lodash';

import { errorBuilder } from 'errors/errors';

const reduceQueryParams = (result, param) => {
  const regexPattern = /filter\[(.+?)\]\[(.+?)\]/g;
  const match = regexPattern.exec(param);
  if (match) {
    const [, name, operation] = match;
    if (name && operation) {
      result[name] = result[name] || [];
      result[name].push(operation);
    }
  }
  return result;
};

/**
 * Middleware to validate operation query parameters
 *
 * @type {RequestHandler}
 */
const validateOperationParams = (req, res, next) => {
  const errors = [];

  const operationParams = _(req.operationDoc.parameters)
    .filter({ in: 'query' })
    .map('name')
    .reduce(reduceQueryParams, {});

  const { query } = req;
  const queryParams = _(query).keys().reduce(reduceQueryParams, {});
  _.forEach(queryParams, (params, key) => {
    if (operationParams[key]) {
      if (params.length > 1) {
        errors.push(`'${key}' can not have multiple operators`);
      }

      _.forEach(params, (param) => {
        if (!_.includes(operationParams[key], param)) {
          errors.push(`'${param}' is not a valid operator for '${key}'`);
        }
      });
    }
  });

  if (errors.length > 0) {
    errorBuilder(res, 400, errors);
  } else {
    next();
  }
};

export { validateOperationParams };

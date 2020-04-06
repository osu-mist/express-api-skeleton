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
  let error = false;

  const operationParams = _(req.operationDoc.parameters)
    .filter({ in: 'query' })
    .map('name')
    .reduce(reduceQueryParams, {});

  const { query } = req;
  const queryParams = _(query).keys().reduce(reduceQueryParams, {});
  _.forEach(queryParams, (param, key) => {
    if (operationParams[key]) {
      if (param.length > 1) {
        errorBuilder(res, 400, [`'${key}' can not have multiple operators`]);
        error = true;
      }

      if (!_.includes(operationParams[key], param[0])) {
        errorBuilder(res, 400, [`'${param[0]}' is not a valid operator for '${key}'`]);
        error = true;
      }
    }
  });

  if (!error) {
    next();
  }
};

export { validateOperationParams };

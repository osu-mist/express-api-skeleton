import _ from 'lodash';

import { errorBuilder } from 'errors/errors';
import { openapi } from 'utils/load-openapi';

// get all boolean query parameters from openapi
const booleanParams = [];
_.reduce(openapi.paths, (result, endpoints) => {
  _.reduce(endpoints, (res, endpoint) => {
    res.push(..._(endpoint.parameters)
      .filter({ in: 'query', schema: { type: 'boolean' } })
      .map('name')
      .value());
    return res;
  }, result);
  return result;
}, booleanParams);

/**
 * Validates boolean query parameters and returns error
 * if they are not true or false
 *
 * @type {RequestHandler}
 */
const validateBooleanParams = (req, res, next) => {
  let err = false;
  _.forEach(req.query, (value, query) => {
    if (booleanParams.includes(query)) {
      if (!(value === 'true' || value === 'false')) {
        errorBuilder(res, 400, [`${query} must be either 'true' or 'false'`]);
        err = true;
      }
    }
  });
  if (!err) {
    next();
  }
};

export { validateBooleanParams };

import _ from 'lodash';

/**
 * Middleware that removes any query parameters that don't appear in the openapi document
 *
 * @type {RequestHandler}
 */
const removeUnknownParams = (req, res, next) => {
  const allowedParameters = _(req.operationDoc.parameters)
    .filter({ in: 'query' })
    .map('name')
    .value();
  req.query = _.pick(req.query, allowedParameters);
  next();
};

export { removeUnknownParams };

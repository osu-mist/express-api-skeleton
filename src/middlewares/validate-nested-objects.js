import _ from 'lodash';

import { errorBuilder } from 'errors/errors';

/**
 * Validates properties in fields that are nested properties
 *
 * @type {RequestHandler}
 */
const validateNestedObjects = (req, res, next) => {
  const errors = [];

  if (_.has(req.route.methods, 'post')) {
    const bodySchema = req
      .operationDoc
      .requestBody
      .content['application/json']
      .schema
      .properties
      .data
      .properties
      .attributes
      .properties;
    const objectSchema = _.pickBy(bodySchema, (value) => value.type === 'object');

    const postBody = _.pickBy(req.body.data.attributes, (value, key) => _.has(objectSchema, key));

    _.forEach(postBody, (value, field) => {
      _.forOwn(value, (something, name) => {
        if (!_.has(objectSchema[field].properties, name)) {
          errors.push(
            `Unrecognized property '${name}' in path: 'data.attributes.${field}', location: 'body'`,
          );
        }
      });
    });
  }

  if (!_.isEmpty(errors)) {
    errorBuilder(res, 400, errors);
  } else {
    next();
  }
};

export { validateNestedObjects };

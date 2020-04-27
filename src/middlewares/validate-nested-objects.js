import _ from 'lodash';

import { errorBuilder } from 'errors/errors';

/**
 * Recursively handle validation in nested objects
 *
 * @param {object} schema schema definition from openapi
 * @param {object} body attributes from body passed in with request
 * @param {string[]} errors list of errors found
 * @param {string} depth current path through nested objects. used to build error string
 */
const handleValidation = (schema, body, errors, depth) => {
  const schemaObjects = _.pickBy(schema, (value) => value.type === 'object');

  const bodyObjects = _.pickBy(body, (value, key) => _.has(schemaObjects, key));

  // check for more nested objects
  _.forOwn(schemaObjects, (value, key) => {
    if (value.type === 'object') {
      handleValidation(value.properties, bodyObjects[key], errors, `${depth}.${key}`);
    }
  });

  _.forOwn(bodyObjects, (value, field) => {
    _.forOwn(value, (property, name) => {
      if (!_.has(schemaObjects[field].properties, name)) {
        errors.push(
          `Unrecognized property '${name}' `
          + `in path: 'data.attributes${depth}.${field}', location: 'body'`,
        );
      }
    });
  });
};

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

    handleValidation(bodySchema, req.body.data.attributes, errors, '');
  }

  if (!_.isEmpty(errors)) {
    errorBuilder(res, 400, errors);
  } else {
    next();
  }
};

export { validateNestedObjects };

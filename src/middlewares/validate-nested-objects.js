import _ from 'lodash';

import { errorBuilder } from 'errors/errors';

const pushError = (errors, name, depth, field, index) => errors.push(
  `Unrecognized property '${name}'`
  + ` in path: 'data.attributes${depth}.${field}`
  + `${index || index === 0 ? `.${index}` : ''}', location: 'body'`,
);

/**
 * Recursively handle validation in nested objects
 *
 * @param {object} schema schema definition from openapi
 * @param {object} body attributes from body passed in with request
 * @param {string[]} errors list of errors found
 * @param {string} depth current path through nested objects. used to build error string
 */
const handleValidation = (schema, body, errors, depth) => {
  const schemaObjects = _.pickBy(
    schema,
    (value) => _.includes(['object', 'array'], value.type),
  );

  const bodyObjects = _.pickBy(body, (value, key) => _.has(schemaObjects, key));

  // check for more nested objects
  _.forOwn(schemaObjects, (value, key) => {
    if (value.type === 'object') {
      handleValidation(value.properties, bodyObjects[key], errors, `${depth}.${key}`);
    }
  });

  _.forOwn(bodyObjects, (value, field) => {
    if (schemaObjects[field].type === 'array') {
      _.forEach(value, (element, index) => {
        _.forOwn(element, (property, name) => {
          if (!_.has(schemaObjects[field].items.properties, name)) {
            pushError(errors, name, depth, field, index);
          }
        });
      });
    } else {
      _.forOwn(value, (property, name) => {
        if (!_.has(schemaObjects[field].properties, name)) {
          pushError(errors, name, depth, field);
        }
      });
    }
  });
};

/**
 * Validates properties in fields that are nested properties
 *
 * @type {RequestHandler}
 */
const validateNestedObjects = (req, res, next) => {
  const errors = [];
  if (_.includes(['post', 'put', 'patch'], _.keys(req.route.methods)[0])) {
    const { attributes } = req.body.data;
    let schemaAttributes = req
      .operationDoc
      .requestBody
      .content['application/json']
      .schema
      .properties
      .data
      .properties
      .attributes;

    if (_.has(schemaAttributes, 'allOf')) {
      const { allOf } = schemaAttributes;
      const mergedAllOf = {};
      _.forEach(allOf, (obj) => {
        _.merge(mergedAllOf, obj);
      });
      schemaAttributes = mergedAllOf;
    }
    const { properties: bodySchema } = schemaAttributes;

    // initial depth is empty
    handleValidation(bodySchema, attributes, errors, '');
  }

  if (!_.isEmpty(errors)) {
    errorBuilder(res, 400, errors);
  } else {
    next();
  }
};

export { validateNestedObjects };

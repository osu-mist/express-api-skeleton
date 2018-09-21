const appRoot = require('app-root-path');
const decamelize = require('decamelize');
const fs = require('fs');
const yaml = require('js-yaml');
const _ = require('lodash');
const JSONAPISerializer = require('jsonapi-serializer').Serializer;

const openapi = yaml.safeLoad(fs.readFileSync(`${appRoot}/openapi.yaml`, 'utf8'));

/**
 * @summary Serializer to JSON API
 * @function
 * @param {[Object]} rows data rows from datasource
 * @param {string} endpointUri endpoint URI for creating self link
 * @returns Serialized resource object
 */
const ResourceSerializer = (rows, endpointUri) => {
  const resourceProp = openapi.components.schemas.Resource.properties;
  const resourceType = resourceProp.type.example;
  const resourceKeys = _.keys(resourceProp.attributes.properties);

  /**
   * The column name getting from database is usually UPPER_CASE.
   * This block of code is to make the camelCase keys defined in openapi.yaml be
   * UPPER_CASE so that the serializer can correctly match the corresponding columns
   * from the raw data rows.
   */
  _.forEach(resourceKeys, (key, index) => {
    resourceKeys[index] = decamelize(key).toUpperCase();
  });

  return new JSONAPISerializer(resourceType, {
    attributes: resourceKeys,
    id: 'ID',
    keyForAttribute: 'camelCase',
    dataLinks: {
      self: row => `${endpointUri}/express-api-skeleton/${row.ID}`,
    },
  }).serialize(rows);
};

module.exports = { ResourceSerializer };

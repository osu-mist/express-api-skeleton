const appRoot = require('app-root-path');
const decamelize = require('decamelize');
const fs = require('fs');
const yaml = require('js-yaml');
const _ = require('lodash');
const JSONAPISerializer = require('jsonapi-serializer').Serializer;

const { selfLink } = appRoot.require('/serializers/uri-builder');
const { paginate } = appRoot.require('/serializers/paginator');

const swagger = yaml.safeLoad(fs.readFileSync(`${appRoot}/swagger.yaml`, 'utf8'));

/**
 * @summary Serializer to JSON API
 * @function
 * @param {[Object]} rows Data rows from datasource
 * @param {string} endpointUri Endpoint URI for creating self link
 * @returns {Object} Serialized resource object
 */
const resourceSerializer = (rows, page) => {
  const resourceProp = swagger.definitions.Resource.properties;
  const resourceType = resourceProp.type.example;
  const resourceKeys = _.keys(resourceProp.attributes.properties);

  /**
   * The column name getting from database is usually UPPER_CASE.
   * This block of code is to make the camelCase keys defined in swagger.yaml be
   * UPPER_CASE so that the serializer can correctly match the corresponding columns
   * from the raw data rows.
   */
  _.forEach(resourceKeys, (key, index) => {
    resourceKeys[index] = decamelize(key).toUpperCase();
  });

  const { paginatedRows, paginationLinks } = paginate(rows, page);

  return new JSONAPISerializer(resourceType, {
    attributes: resourceKeys,
    id: 'ID',
    keyForAttribute: 'camelCase',
    dataLinks: {
      self: row => selfLink(row.ID),
    },
    topLevelLinks: paginationLinks,
  }).serialize(paginatedRows);
};

module.exports = { resourceSerializer };

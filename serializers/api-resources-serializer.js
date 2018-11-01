const appRoot = require('app-root-path');
const decamelize = require('decamelize');
const fs = require('fs');
const yaml = require('js-yaml');
const _ = require('lodash');
const JSONAPISerializer = require('jsonapi-serializer').Serializer;

const { paginate } = appRoot.require('/serializers/paginator');
const { serializerOptions } = appRoot.require('/serializers/jsonapi');

const swagger = yaml.safeLoad(fs.readFileSync(`${appRoot}/swagger.yaml`, 'utf8'));
const apiResourceProp = swagger.definitions.ApiResource.properties;
const apiResourceType = apiResourceProp.type.example;
const apiResourceKeys = _.keys(apiResourceProp.attributes.properties);

/**
 * The column name getting from database is usually UPPER_CASE.
 * This block of code is to make the camelCase keys defined in swagger.yaml be
 * UPPER_CASE so that the serializer can correctly match the corresponding columns
 * from the raw data rows.
 */
_.forEach(apiResourceKeys, (key, index) => {
  apiResourceKeys[index] = decamelize(key).toUpperCase();
});

const serializerArgs = {
  identifierField: 'ID',
  resourceKeys: apiResourceKeys,
};

/**
 * @summary Serializer apiResources to JSON API
 * @function
 * @param {[Object]} rows Data rows from datasource
 * @param {Object} query Query parameters
 * @returns {Object} Serialized apiResources object
 */
const apiResourcesSerializer = (rows, query) => {
  /**
   * Add pagination links and meta information to options if pagination is enabled
   */
  const { page } = query;
  if (page) {
    const pagination = paginate(rows, page);
    pagination.totalResults = rows.length;
    serializerArgs.pagination = pagination;
    rows = pagination.paginatedRows;
  }

  return new JSONAPISerializer(
    apiResourceType,
    serializerOptions(serializerArgs),
  ).serialize(rows);
};

/**
 * @summary Serializer apiResource to JSON API
 * @function
 * @param {Object} row Data row from datasource
 * @param {string} endpointUri Endpoint URI for creating self link
 * @returns {Object} Serialized apiResource object
 */
const apiResourceSerializer = row => new JSONAPISerializer(
  apiResourceType,
  serializerOptions(serializerArgs),
).serialize(row);

module.exports = { apiResourcesSerializer, apiResourceSerializer };

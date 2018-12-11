const appRoot = require('app-root-path');
const decamelize = require('decamelize');
const _ = require('lodash');
const JSONAPISerializer = require('jsonapi-serializer').Serializer;

const { paginate } = appRoot.require('utils/paginator');
const { serializerOptions } = appRoot.require('utils/jsonapi');
const { openapi } = appRoot.require('utils/load-openapi');
const { querySelfLink, idSelfLink } = appRoot.require('utils/uri-builder');

const petResourceProp = openapi.definitions.PetResource.properties;
const petResourceType = petResourceProp.type.example;
const petResourceKeys = _.keys(petResourceProp.attributes.properties);
const petResourcePath = 'pets';

/**
 * The column name getting from database is usually UPPER_CASE.
 * This block of code is to make the camelCase keys defined in openapi.yaml be
 * UPPER_CASE so that the serializer can correctly match the corresponding columns
 * from the raw data rows.
 */
_.forEach(petResourceKeys, (key, index) => {
  petResourceKeys[index] = decamelize(key).toUpperCase();
});

/**
 * @summary Serializer petResources to JSON API
 * @function
 * @param {[Object]} rawPets Raw data rows from data source
 * @param {Object} query Query parameters
 * @returns {Object} Serialized petResources object
 */
const SerializedPets = (rawPets, query) => {
  const serializerArgs = {
    identifierField: 'ID',
    resourceKeys: petResourceKeys,
  };

  /**
   * Add pagination links and meta information to options if pagination is enabled
   */
  const pageQuery = {
    size: query['page[size]'],
    number: query['page[number]'],
  };

  if (pageQuery.size || pageQuery.number) {
    const pagination = paginate(rawPets, pageQuery);
    pagination.totalResults = rawPets.length;
    serializerArgs.pagination = pagination;
    rawPets = pagination.paginatedRows;
  }

  const topLevelSelfLink = querySelfLink(query, petResourcePath);

  return new JSONAPISerializer(
    petResourceType,
    serializerOptions(serializerArgs, petResourcePath, topLevelSelfLink),
  ).serialize(rawPets);
};

/**
 * @summary Serializer petResource to JSON API
 * @function
 * @param {Object} rawPet Raw data row from data source
 * @param {string} endpointUri Endpoint URI for creating self-link
 * @returns {Object} Serialized petResource object
 */
const SerializedPet = (rawPet) => {
  const serializerArgs = {
    identifierField: 'ID',
    resourceKeys: petResourceKeys,
  };

  const topLevelSelfLink = idSelfLink(rawPet.ID, petResourcePath);

  return new JSONAPISerializer(
    petResourceType,
    serializerOptions(serializerArgs, petResourcePath, topLevelSelfLink),
  ).serialize(rawPet);
};
module.exports = { SerializedPets, SerializedPet };

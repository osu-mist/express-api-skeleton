const appRoot = require('app-root-path');
const decamelize = require('decamelize');
const JSONAPISerializer = require('jsonapi-serializer').Serializer;
const _ = require('lodash');

const { openapi } = appRoot.require('app').locals;
const { serializerOptions } = appRoot.require('utils/jsonapi');
const { paginate } = appRoot.require('utils/paginator');
const { querySelfLink, idSelfLink } = appRoot.require('utils/uri-builder');

const petResourceProp = openapi.definitions.PetResource.properties;
const petResourceType = petResourceProp.type.enum[0];
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
 * @summary Serialize petResources to JSON API
 * @function
 * @param {[Object]} rawPets Raw data rows from data source
 * @param {Object} query Query parameters
 * @returns {Object} Serialized petResources object
 */
const serializePets = (rawPets, query) => {
  /**
   * Add pagination links and meta information to options if pagination is enabled
   */
  const pageQuery = {
    size: query['page[size]'],
    number: query['page[number]'],
  };

  const pagination = paginate(rawPets, pageQuery);
  pagination.totalResults = rawPets.length;
  rawPets = pagination.paginatedRows;

  const topLevelSelfLink = querySelfLink(query, petResourcePath);
  const serializerArgs = {
    identifierField: 'ID',
    resourceKeys: petResourceKeys,
    pagination,
    resourcePath: petResourcePath,
    topLevelSelfLink,
  };

  return new JSONAPISerializer(
    petResourceType,
    serializerOptions(serializerArgs),
  ).serialize(rawPets);
};

/**
 * @summary Serialize petResource to JSON API
 * @function
 * @param {Object} rawPet Raw data row from data source
 * @returns {Object} Serialized petResource object
 */
const serializePet = (rawPet) => {
  const topLevelSelfLink = idSelfLink(rawPet.ID, petResourcePath);
  const serializerArgs = {
    identifierField: 'ID',
    resourceKeys: petResourceKeys,
    resourcePath: petResourcePath,
    topLevelSelfLink,
  };

  return new JSONAPISerializer(
    petResourceType,
    serializerOptions(serializerArgs, petResourcePath, topLevelSelfLink),
  ).serialize(rawPet);
};
module.exports = { serializePets, serializePet };

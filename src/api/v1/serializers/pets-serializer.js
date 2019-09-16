import { Serializer as JsonApiSerializer } from 'jsonapi-serializer';
import _ from 'lodash';

import { serializerOptions } from 'utils/jsonapi';
import { openapi } from 'utils/load-openapi';
import { paginate } from 'utils/paginator';
import { apiBaseUrl, resourcePathLink, paramsLink } from 'utils/uri-builder';

const petResourceProp = openapi.definitions.PetResource.properties;
const petResourceType = petResourceProp.type.enum[0];
const petResourceKeys = _.keys(petResourceProp.attributes.properties);
const petResourcePath = 'pets';
const petResourceUrl = resourcePathLink(apiBaseUrl, petResourcePath);

/**
 * Serialize petResources to JSON API
 *
 * @param {object[]} rawPets Raw data rows from data source
 * @param {object} query Query parameters
 * @returns {object} Serialized petResources object
 */
const serializePets = (rawPets, query) => {
  // Add pagination links and meta information to options if pagination is enabled
  const pageQuery = {
    size: query['page[size]'],
    number: query['page[number]'],
  };

  const pagination = paginate(rawPets, pageQuery);
  pagination.totalResults = rawPets.length;
  rawPets = pagination.paginatedRows;

  const topLevelSelfLink = paramsLink(petResourceUrl, query);
  const serializerArgs = {
    identifierField: 'id',
    resourceKeys: petResourceKeys,
    pagination,
    resourcePath: petResourcePath,
    topLevelSelfLink,
    query,
    enableDataLinks: true,
  };

  return new JsonApiSerializer(
    petResourceType,
    serializerOptions(serializerArgs),
  ).serialize(rawPets);
};

/**
 * Serialize petResource to JSON API
 *
 * @param {object} rawPet Raw data row from data source
 * @param {boolean} postedPet true signals returning resource path as self link
 * @returns {object} Serialized petResource object
 */
const serializePet = (rawPet, postedPet = false) => {
  const topLevelSelfLink = postedPet ? petResourceUrl : resourcePathLink(petResourceUrl, rawPet.id);

  const serializerArgs = {
    identifierField: 'id',
    resourceKeys: petResourceKeys,
    resourcePath: petResourcePath,
    topLevelSelfLink,
    enableDataLinks: true,
  };

  return new JsonApiSerializer(
    petResourceType,
    serializerOptions(serializerArgs),
  ).serialize(rawPet);
};
export { serializePets, serializePet };

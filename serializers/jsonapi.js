const appRoot = require('app-root-path');
const fs = require('fs');
const yaml = require('js-yaml');
const _ = require('lodash');
const JSONAPISerializer = require('jsonapi-serializer').Serializer;

const openapi = yaml.safeLoad(fs.readFileSync(`${appRoot}/openapi.yaml`, 'utf8'));

const ResourceSerializer = (rows, endpointUri) => {
  const resourceProp = openapi.components.schemas.Resource.properties;
  const resourceType = resourceProp.type.example;
  const resourceKeys = _.keys(resourceProp.attributes.properties);

  return new JSONAPISerializer(resourceType, {
    attributes: resourceKeys,
    id: 'id',
    keyForAttribute: 'camelCase',
    dataLinks: {
      self: row => `${endpointUri}/express-api-skeleton/${row.ID}`,
    },
  }).serialize(rows);
};

module.exports = { ResourceSerializer };

const appRoot = require('app-root-path');
const config = require('config');
const fs = require('fs');
const yaml = require('js-yaml');
const decodeUriComponent = require('decode-uri-component');
const url = require('url');

const api = appRoot.require('/package.json').name;

const { protocol, hostname } = config.get('server');
const { basePath } = yaml.safeLoad(fs.readFileSync(`${appRoot}/openapi.yaml`, 'utf8'));

/**
 * @summary Self link builder
 * @function
 * @param {string} id
 * @returns A self link URL
 */
const selfLink = id => url.format({
  protocol,
  hostname,
  pathname: `${basePath}/${api}/${id}`,
});

/**
 * @summary Top level query link builder
 * @function
 * @param {object} query
 * @returns A decoded url formatted with query parameters in the query object.
 */
const querySelfLink = query => decodeUriComponent(url.format({
  protocol,
  hostname,
  pathname: `${basePath}/${api}`,
  query,
}));

/**
 * @summary Paginated link builder
 * @function
 * @param {number} pageNumber Page number of results
 * @param {number} pageSize Number of results to return
 * @returns A decoded paginated link URL
 */
const paginatedLink = (pageNumber, pageSize) => querySelfLink({
  'page[number]': pageNumber,
  'page[size]': pageSize,
});

module.exports = { selfLink, paginatedLink, querySelfLink };

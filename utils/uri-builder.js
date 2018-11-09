const appRoot = require('app-root-path');
const config = require('config');
const fs = require('fs');
const yaml = require('js-yaml');
const decodeUriComponent = require('decode-uri-component');
const url = require('url');

const { protocol, hostname } = config.get('server');
const { basePath } = yaml.safeLoad(fs.readFileSync(`${appRoot}/openapi.yaml`, 'utf8'));

/**
 * @summary Self link builder
 * @function
 * @param {string} id
 * @returns A self link URL
 */
const selfLink = (id, path) => url.format({
  protocol,
  hostname,
  pathname: `${basePath}/${path}/${id}`,
});

/**
 * @summary Top level query link builder
 * @function
 * @param {object} query
 * @returns A decoded url formatted with query parameters in the query object.
 */
const querySelfLink = (query, path) => decodeUriComponent(url.format({
  protocol,
  hostname,
  pathname: `${basePath}/${path}`,
  query,
}));

/**
 * @summary Paginated link builder
 * @function
 * @param {number} pageNumber Page number of results
 * @param {number} pageSize Number of results to return
 * @returns A decoded paginated link URL
 */
const paginatedLink = (pageNumber, pageSize, path) => querySelfLink({
  'page[number]': pageNumber,
  'page[size]': pageSize,
}, path);

module.exports = { selfLink, paginatedLink, querySelfLink };

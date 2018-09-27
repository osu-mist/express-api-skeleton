const appRoot = require('app-root-path');
const config = require('config');
const url = require('url');

const { protocol, hostname } = config.get('server');
const api = appRoot.require('/package.json').name;

/**
 * @summary Self link builder
 * @function
 * @param {string} id
 * @returns A self link URL
 */
const selfLink = id => url.format({
  protocol,
  hostname,
  pathname: `/${api}/${id}`,
});

/**
 * @summary Paginated link builder
 * @function
 * @param {number} pageNumber Page number of results
 * @param {number} pageSize Number of results to return
 * @returns A paginated link URL
 */
const paginatedLink = (pageNumber, pageSize) => url.format({
  protocol,
  hostname,
  pathname: `/${api}`,
  query: {
    'page[number]': pageNumber,
    'page[size]': pageSize,
  },
});

module.exports = { selfLink, paginatedLink };

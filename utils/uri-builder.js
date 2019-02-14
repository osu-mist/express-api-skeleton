const appRoot = require('app-root-path');
const config = require('config');
const queryString = require('query-string');
const url = require('url');

const { openapi: { basePath } } = appRoot.require('utils/load-openapi');

const { protocol, hostname } = config.get('server');

/**
 * @summary API base URL
 */
const apiBaseUrl = url.format({ protocol, hostname, pathname: basePath });

/**
 * @summary Resource path link builder
 * @function
 * @param {string} baseUrl base URL
 * @param {string} resourcePath resource path
 * @returns A resource path URL
 */
const resourcePathLink = (baseUrl, resourcePath) => `${baseUrl}/${resourcePath}`;

/**
 * @summary Params link builder
 * @function
 * @param {string} baseUrl base URL
 * @param {string} params query params
 * @returns A decoded url formatted with query parameters in the query object
 */
const paramsLink = (baseUrl, params) => `${baseUrl}?${queryString.stringify(params, { encode: false })}`;

module.exports = {
  apiBaseUrl,
  resourcePathLink,
  paramsLink,
};

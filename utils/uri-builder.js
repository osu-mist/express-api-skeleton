const appRoot = require('app-root-path');
const config = require('config');
const _ = require('lodash');
const queryString = require('query-string');
const url = require('url');

const { openapi: { basePath } } = appRoot.require('utils/load-openapi');

const { protocol, hostname } = config.get('server');

/** API base URL */
const apiBaseUrl = url.format({ protocol, hostname, pathname: basePath });

/**
 * Resource path link builder
 *
 * @param {string} baseUrl base URL
 * @param {string} resourcePath resource path
 * @returns {string} resource path URL
 */
const resourcePathLink = (baseUrl, resourcePath) => `${baseUrl}/${resourcePath}`;

/**
 * Params link builder
 *
 * @param {string} baseUrl base URL
 * @param {string} params query params
 * @returns {string} decoded url formatted with query parameters in the query object
 */
const paramsLink = (baseUrl, params) => {
  const querySeparator = _.includes(baseUrl, '?') ? '&' : '?';
  return !_.isEmpty(params)
    ? `${baseUrl}${querySeparator}${queryString.stringify(params, { encode: false })}`
    : baseUrl;
};

module.exports = {
  apiBaseUrl,
  resourcePathLink,
  paramsLink,
};

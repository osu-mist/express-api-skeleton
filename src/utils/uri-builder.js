import url from 'url';

import config from 'config';
import _ from 'lodash';
import queryString from 'query-string';

import { openapi } from 'utils/load-openapi';

const { basePath } = openapi;
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

export { apiBaseUrl, resourcePathLink, paramsLink };

import url from 'url';

import config from 'config';
import _ from 'lodash';
import queryString from 'query-string';

import openapi from 'utils/load-openapi';

const { basePath } = openapi;
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
const paramsLink = (baseUrl, params) => {
  const querySeparator = _.includes(baseUrl, '?') ? '&' : '?';
  return !_.isEmpty(params)
    ? `${baseUrl}${querySeparator}${queryString.stringify(params, { encode: false })}`
    : baseUrl;
};

export { apiBaseUrl, resourcePathLink, paramsLink };

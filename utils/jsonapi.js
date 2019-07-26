const appRoot = require('app-root-path');
const _ = require('lodash');

const { apiBaseUrl, resourcePathLink, paramsLink } = appRoot.require('utils/uri-builder');


/**
 * Helper function to generate pagination params
 *
 * @param {number} pageNumber page number
 * @param {number} pageSize page size
 * @returns {object} pagination parameters object
 */
const pageParamsBuilder = (pageNumber, pageSize) => (
  { 'page[number]': pageNumber, 'page[size]': pageSize }
);

/**
 * Generate JSON API serializer options
 *
 * @param {object[]} serializerArgs JSON API serializer arguments
 * @returns {object} JSON API serializer options
 */
const serializerOptions = (serializerArgs) => {
  const {
    identifierField,
    resourceKeys,
    pagination,
    resourcePath,
    topLevelSelfLink,
    query,
    keyForAttribute,
    enableDataLinks,
  } = serializerArgs;

  const resourceUrl = resourcePathLink(apiBaseUrl, resourcePath);
  const options = {
    pluralizeType: false,
    attributes: resourceKeys,
    id: identifierField,
    keyForAttribute: keyForAttribute || 'camelCase',
    dataLinks: {
      self: (row) => {
        if (enableDataLinks) {
          return resourcePathLink(resourceUrl, row[identifierField]);
        }
        return null;
      },
    },
    topLevelLinks: { self: topLevelSelfLink },
  };

  if (pagination) {
    const {
      pageNumber,
      totalPages,
      nextPage,
      prevPage,
      pageSize,
      totalResults,
    } = pagination;

    options.topLevelLinks = _.assign(options.topLevelLinks, {
      first: paramsLink(paramsLink(resourceUrl, pageParamsBuilder(1, pageSize)), query),
      last: paramsLink(paramsLink(resourceUrl, pageParamsBuilder(totalPages, pageSize)), query),
      next: nextPage
        ? paramsLink(paramsLink(resourceUrl, pageParamsBuilder(nextPage, pageSize)), query)
        : null,
      prev: prevPage
        ? paramsLink(paramsLink(resourceUrl, pageParamsBuilder(prevPage, pageSize)), query)
        : null,
    });

    options.meta = {
      totalResults,
      totalPages,
      currentPageNumber: pageNumber,
      currentPageSize: pageSize,
    };
  }

  return options;
};

module.exports = { serializerOptions };

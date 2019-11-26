import _ from 'lodash';

import { apiBaseUrl, resourcePathLink, paramsLink } from 'utils/uri-builder';


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
    transformFunction,
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

  if (transformFunction) options.transform = transformFunction;

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
      first: paramsLink(resourceUrl, { ...query, ...pageParamsBuilder(1, pageSize) }),
      last: paramsLink(resourceUrl, { ...query, ...pageParamsBuilder(totalPages, pageSize) }),
      next: nextPage
        ? paramsLink(resourceUrl, { ...query, ...pageParamsBuilder(nextPage, pageSize) })
        : null,
      prev: prevPage
        ? paramsLink(resourceUrl, { ...query, ...pageParamsBuilder(prevPage, pageSize) })
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

export { serializerOptions };

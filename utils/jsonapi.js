const appRoot = require('app-root-path');
const _ = require('lodash');

const { paginatedLink, idSelfLink } = appRoot.require('utils/uri-builder');

/**
 * @summary Generate JSON API serializer options
 * @function
 * @param {[Object]} serializerArgs JSON API serializer arguments
 * @returns {Object} JSON API serializer options
 */
const serializerOptions = (serializerArgs) => {
  const {
    identifierField,
    resourceKeys,
    pagination,
    resourcePath,
    topLevelSelfLink,
    keyForAttribute,
    enableDataLinks,
  } = serializerArgs;

  const options = {
    attributes: resourceKeys,
    id: identifierField,
    keyForAttribute: keyForAttribute || 'camelCase',
    dataLinks: {
      self: (row) => {
        if (enableDataLinks) {
          return idSelfLink(row[identifierField], resourcePath);
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
      first: paginatedLink(pageNumber, pageSize, resourcePath),
      last: paginatedLink(totalPages, pageSize, resourcePath),
      next: paginatedLink(nextPage, pageSize, resourcePath),
      prev: paginatedLink(prevPage, pageSize, resourcePath),
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

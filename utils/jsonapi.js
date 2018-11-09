const appRoot = require('app-root-path');

const { paginatedLink, selfLink } = appRoot.require('utils/uri-builder');

/**
 * @summary Generate JSON API serializer options
 * @function
 * @param {[Object]} serializerArgs JSON API serializer arguments
 * @param {string} resourcePath resource path
 * @returns {Object} JSON API serializer options
 */
const serializerOptions = (serializerArgs, resourcePath) => {
  const { identifierField, resourceKeys, pagination } = serializerArgs;
  const options = {
    attributes: resourceKeys,
    id: identifierField,
    keyForAttribute: 'camelCase',
    dataLinks: { self: row => selfLink(row[identifierField], resourcePath) },
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

    options.topLevelLinks = {
      first: paginatedLink(pageNumber, pageSize, resourcePath),
      last: paginatedLink(totalPages, pageSize, resourcePath),
      next: paginatedLink(nextPage, pageSize, resourcePath),
      prev: paginatedLink(prevPage, pageSize, resourcePath),
    };
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

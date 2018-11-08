const appRoot = require('app-root-path');

const { paginatedLink, selfLink } = appRoot.require('serializers/uri-builder');

/**
 * @summary Generate JSON API serializer options
 * @function
 * @param {[Object]} serializerArgs JSON API serializer arguments
 * @returns {Object} JSON API serializer options
 */
const serializerOptions = (serializerArgs, path) => {
  const { identifierField, resourceKeys, pagination } = serializerArgs;
  const options = {
    attributes: resourceKeys,
    id: identifierField,
    keyForAttribute: 'camelCase',
    dataLinks: { self: row => selfLink(row[identifierField], path) },
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
      first: paginatedLink(pageNumber, pageSize, path),
      last: paginatedLink(totalPages, pageSize, path),
      next: paginatedLink(nextPage, pageSize, path),
      prev: paginatedLink(prevPage, pageSize, path),
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

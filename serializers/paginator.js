const _ = require('lodash');

const DEFAULT_PAGE_SIZE = 25;

/**
 * @summary Paginate data rows
 * @function
 * @param {[Object]} rows Data rows
 * @param {Object} page Pagination query parameter
 * @returns {*} Paginated data rows and pagination links
 */
const paginate = (rows, page) => {
  const pageNumber = page && page.number ? parseInt(page.number, 10) : 1;
  const pageSize = page && page.size ? parseInt(page.size, 10) : DEFAULT_PAGE_SIZE;
  const totalPages = Math.ceil(rows.length / pageSize);
  const paginatedRows = _.slice(rows, (pageNumber - 1) * pageSize, pageNumber * pageSize);
  const isOutOfBounds = pageNumber < 1 || pageNumber > totalPages;
  const nextPage = isOutOfBounds || pageNumber >= totalPages ? null : pageNumber + 1;
  const prevPage = isOutOfBounds || pageNumber <= 0 ? null : pageNumber - 1;

  return {
    paginatedRows,
    totalPages,
    pageNumber,
    pageSize,
    nextPage,
    prevPage,
  };
};

module.exports = { paginate };

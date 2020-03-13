import _ from 'lodash';

/**
 * Return parsed query with keys changed to remove the "filter[]" wrapper
 *
 * @param {object} query query parameters
 * @returns {object} parsed query
 */
const parseQuery = (query) => {
  const parsedQuery = {};
  _.forEach(query, (value, key) => {
    const parsedKey = key.match(/^filter\[(.*)\]$/)[1];
    parsedQuery[parsedKey] = value;
  });

  return parsedQuery;
};

export { parseQuery };

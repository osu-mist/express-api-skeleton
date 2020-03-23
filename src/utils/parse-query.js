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
    const matched = key.match(/^filter\[(.*)\]$/);
    if (matched && matched.length > 1) {
      const [, parsedKey] = matched;
      parsedQuery[parsedKey] = value;
    } else {
      parsedQuery[key] = value;
    }
  });

  return parsedQuery;
};

export { parseQuery };

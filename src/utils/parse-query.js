import _ from 'lodash';

const operatorSymbols = {
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
  neq: '!=',
};

/**
 * Return parsed query with keys changed to remove the "filter[]" wrapper
 *
 * @param {object} query query parameters
 * @returns {object} parsed query
 */
const parseQuery = (query) => {
  const parsedQuery = {};
  _.forEach(query, (value, key) => {
    const regexPattern = /filter\[(.+?)\](\[(.+?)\]){0,1}/g;
    const matched = regexPattern.exec(key);
    if (matched && matched.length > 1) {
      // array destructuring. only need the 1st and 3rd element
      const [, parsedKey, , operator] = matched;
      if (operator) {
        parsedQuery[parsedKey] = { operator: operatorSymbols[operator] || operator, value };
      } else {
        parsedQuery[parsedKey] = value;
      }
    } else {
      parsedQuery[key] = value;
    }
  });

  return parsedQuery;
};

export { parseQuery };

import _ from 'lodash';

/**
 * Converts values that are strings but should be numbers according to openapi
 *
 * @param {object} rows raw data from data source
 * @param {object} properties openapi properties for the resource type of rows
 */
const stringsToNumbers = (rows, properties) => {
  const fields = _.pickBy(
    properties,
    (value) => _.includes(['number', 'object', 'array'], value.type),
  );

  _.forEach(rows, (row) => {
    _.forOwn(fields, (field, key) => {
      if (row[key]) {
        if (field.format === 'integer') {
          row[key] = Number(row[key]);
        } else if (field.format === 'float') {
          row[key] = parseFloat(row[key]);
        } else if (field.type === 'object') {
          stringsToNumbers([row[key]], field.properties);
        } else if (field.type === 'array') {
          stringsToNumbers(row[key], field.items.properties);
        }
      }
    });
  });
};

export { stringsToNumbers };

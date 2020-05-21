import _ from 'lodash';

const stringsToNumbers = (rows, properties) => {
  const fields = _.pickBy(
    properties,
    (value) => value.type === 'number' || value.type === 'object',
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
        }
      }
    });
  });
};

export { stringsToNumbers };

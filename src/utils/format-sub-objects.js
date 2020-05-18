import _ from 'lodash';

/**
 * Takes list of raw data from data source and looks for keys that should be expanded into
 * nested objects
 * { 'addressType.code': 'CM' } => { addressType: { code: 'CM' } }
 *
 * @param {object[]} rawData raw output from data source
 */
const formatSubObjects = (rawData) => {
  _.forEach(rawData, (data) => {
    _.forEach(data, (value, key) => {
      const splitKey = key.split('.');
      if (splitKey.length > 1) {
        _.set(data, splitKey, value);
        delete data[key];
      } else if (_.isArray(value)) {
        formatSubObjects(value);
      }
    });
  });
};

export { formatSubObjects };

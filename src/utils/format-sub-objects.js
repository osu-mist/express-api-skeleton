import _ from 'lodash';

/**
 * Recursively adds nesting sub-objects from keyList
 * Once keyList is empty finalValue is assigned to end the nesting objects
 *
 * @param {string[]} keyList
 * @param {object} currObject
 * @param {string} finalValue
 */
const expandKey = (keyList, currObject, finalValue) => {
  // if this is the last key in keyList set it equal to finalValue and end recursion
  if (keyList.length === 1) {
    currObject[keyList[0]] = finalValue;
  } else {
    // create empty object for next nesting level if it is null
    if (!currObject[keyList[0]]) {
      currObject[keyList[0]] = {};
    }
    expandKey(_.tail(keyList), currObject[keyList[0]], finalValue);
  }
};

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
        expandKey(splitKey, data, value);
      }
    });
  });
};

export { formatSubObjects };

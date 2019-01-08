const fs = require('fs');

/**
 * @summary Validate a file path and throw an error if invalid
 * @function
 * @throws Throws an error if the file path is not valid
 * @param {string} path
 */
const validateFilePath = (path) => {
  if (!fs.existsSync(path)) {
    throw new Error(`Path: '${path}' is invalid`);
  }
};

/**
 * @summary Read a JSON file and return the contents as an object
 * @function
 * @param {string} filePath
 * @returns {Object}
 */
const readJSONFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return null;
};

/**
 * @summary Write an object to a JSON file with formatting
 * @function
 * @param {string} filePath
 * @param {Object} data
 * @param {Object} options
 */
const writeJSONFile = (filePath, data, options = {}) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), options);
};

module.exports = { validateFilePath, readJSONFile, writeJSONFile };

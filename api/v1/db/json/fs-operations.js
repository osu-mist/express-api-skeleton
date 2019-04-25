const config = require('config');
const fs = require('fs');

const { dbPath } = config.get('dataSources.json');

/**
 * @summary Validate a file path and throw an error if invalid
 * @function
 * @throws Throws an error if the file path is not valid
 * @param {string} path
 */
const validateFilePath = async (path) => {
  fs.access(path, (err) => {
    if (err) {
      throw new Error(`Path: '${path}' is invalid: ${err}`);
    }
  });
};

/**
 * @summary Validate database file path
 * @function
 */
const validateJsonDb = () => validateFilePath(dbPath);

/**
 * @summary Read a JSON file and return the contents as an object
 * @function
 * @param {string} filePath
 * @returns {Object} Contents of JSON file or undefined if the file doesn't exist
 */
const readJsonFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return undefined;
};

/**
 * @summary Write an object to a JSON file with formatting
 * @function
 * @param {string} filePath
 * @param {Object} data
 * @param {Object} options
 */
const writeJsonFile = (filePath, data, options = {}) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), options);
};

/**
 * @summary Delete a file
 * @function
 * @param {string} filePath
 * @returns true if file was deleted and undefined if file was not found
 */
const deleteFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return undefined;
};

module.exports = {
  validateFilePath,
  validateJsonDb,
  readJsonFile,
  writeJsonFile,
  deleteFile,
};

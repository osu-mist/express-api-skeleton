const config = require('config');
const fs = require('fs');

const { dbPath } = config.get('dataSources.json');

/**
 * Validate a file path and throw an error if invalid
 *
 * @throws Throws an error if the file path is not valid
 * @param {string} path Path to file
 */
const validateFilePath = async (path) => {
  fs.access(path, (err) => {
    if (err) {
      throw new Error(`Path: '${path}' is invalid: ${err}`);
    }
  });
};

/**
 * Validate database file path
 *
 * @returns {Promise} Promise that resolves when DB is valid and rejects when invalid
 */
const validateJsonDb = () => validateFilePath(dbPath);

/**
 * Read a JSON file and return the contents as an object
 *
 * @param {string} filePath Path to file
 * @returns {object} Contents of JSON file or undefined if the file doesn't exist
 */
const readJsonFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return undefined;
};

/**
 * Write an object to a JSON file with formatting
 *
 * @param {string} filePath Path to file
 * @param {object} data JSON object to write
 * @param {object} options Additional options to pass to fs.writeFileSync()
 */
const writeJsonFile = (filePath, data, options = {}) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), options);
};

/**
 * Delete a file
 *
 * @param {string} filePath Path to file
 * @returns {boolean|undefined} true if file was deleted and undefined if file was not found
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

import fs from 'fs';

import config from 'config';

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
 * @returns {object} Contents of JSON file or undefined if the file doesn't exist
 */
const readJsonFile = () => {
  if (fs.existsSync(dbPath)) {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  }
  return undefined;
};

/**
 * Write an object to a JSON file with formatting
 *
 * @param {object} data JSON object to write
 * @param {object} options Additional options to pass to fs.writeFileSync()
 */
const writeJsonFile = (data, options = {}) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), options);
};

export {
  validateFilePath,
  validateJsonDb,
  readJsonFile,
  writeJsonFile,
};

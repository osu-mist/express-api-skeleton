const { validateFilePath } = require('./fs-operations');

const dbPath = 'tests/unit/mock-data.json';

/**
 * @summary Validate database configuration
 * @function
 */
const validateDatabase = () => validateFilePath(dbPath);

module.exports = { validateDatabase };

const { validateFilePath } = require('./fs-operations');

const dbPath = 'tests/unit/mock-data.json';

/**
 * @summary Validate database configuration
 * @function
 */
const validateDataSource = () => validateFilePath(dbPath);

module.exports = { validateDataSource };

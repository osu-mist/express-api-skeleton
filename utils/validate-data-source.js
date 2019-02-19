const appRoot = require('app-root-path');

const { validateFilePath } = appRoot.require('api/v1/db/json/fs-operations');

const dbPath = 'tests/unit/mock-data.json';

/**
 * @summary Validate database configuration
 * @function
 */
const validateDataSource = () => validateFilePath(dbPath);

module.exports = { validateDataSource };

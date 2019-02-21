const appRoot = require('app-root-path');

const { validateJsonDb } = appRoot.require('api/v1/db/json/fs-operations');
const { validateOracleDb } = appRoot.require('api/v1/db/oracledb/connection');

/**
 * @summary Validate database configuration
 * @function
 * @param {string} dataSourceType data source type
 */
const validateDataSource = (dataSourceType) => {
  const validationMethods = {
    aws: null, // TODO: add AWS validation method
    http: null, // TODO: add HTTP validation method
    json: validateJsonDb,
    oracledb: validateOracleDb,
  };

  try {
    if (dataSourceType in validationMethods) {
      validationMethods[dataSourceType]();
    } else {
      throw new Error(`Data source type: '${dataSourceType}' is not recognized.`);
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = { validateDataSource };

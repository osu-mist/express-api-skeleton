const appRoot = require('app-root-path');
const config = require('config');
const _ = require('lodash');

const { dataSources } = config.get('dataSources');
const json = dataSources.includes('json')
  ? appRoot.require('api/v1/db/json/fs-operations').validateJsonDb
  : null;
const oracledb = dataSources.includes('oracledb')
  ? appRoot.require('api/v1/db/oracledb/connection').validateOracleDb
  : null;

/**
 * @summary Validate database configuration
 * @function
 */
const validateDataSource = () => {
  const validationMethods = {
    aws: null, // TODO: add AWS validation method
    http: null, // TODO: add HTTP validation method
    json,
    oracledb,
  };

  _.each(dataSources, (dataSourceType) => {
    if (dataSourceType in validationMethods) {
      validationMethods[dataSourceType]();
    } else {
      throw new Error(`Data source type: '${dataSourceType}' is not recognized.`);
    }
  });
};

module.exports = { validateDataSource };

const appRoot = require('app-root-path');
const config = require('config');
const _ = require('lodash');

const { openapi } = appRoot.require('utils/load-openapi');

const { dataSources } = config.get('dataSources');
const json = dataSources.includes('json')
  ? appRoot.require(`/api${openapi.basePath}/db/json/fs-operations`).validateJsonDb
  : null;
const oracledb = dataSources.includes('oracledb')
  ? appRoot.require(`/api${openapi.basePath}/db/oracledb/connection`).validateOracleDb
  : null;
const awsS3 = dataSources.includes('awsS3')
  ? appRoot.require(`/api${openapi.basePath}/db/awsS3/aws-operations`).validateAwsS3
  : null;
const ldap = dataSources.includes('ldap')
  ? appRoot.require(`/api${openapi.basePath}/db/ldap/connection`).validateLdap
  : null;

/**
 * @summary Validate database configuration
 * @function
 */
const validateDataSource = () => {
  const validationMethods = {
    awsS3,
    http: null, // TODO: add HTTP validation method
    json,
    oracledb,
    ldap,
  };

  _.each(dataSources, (dataSourceType) => {
    if (dataSourceType in validationMethods) {
      validationMethods[dataSourceType]().catch((err) => {
        console.error(err);
        process.exit(1);
      });
    } else {
      throw new Error(`Data source type: '${dataSourceType}' is not recognized.`);
    }
  });
};

module.exports = { validateDataSource };

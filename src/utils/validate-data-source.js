import config from 'config';
import _ from 'lodash';

const { dataSources } = config.get('dataSources');
const awsS3 = dataSources.includes('awsS3')
  ? require('api/v1/db/awsS3/aws-operations').validateAwsS3
  : null;
const json = dataSources.includes('json')
  ? require('api/v1/db/json/fs-operations').validateJsonDb
  : null;
const oracledb = dataSources.includes('oracledb')
  ? require('api/v1/db/oracledb/connection').validateOracleDb
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

export default validateDataSource;

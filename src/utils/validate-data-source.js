import config from 'config';
import _ from 'lodash';

import { logger } from 'utils/logger';

const { dataSources } = config.get('dataSources');
const awsS3 = dataSources.includes('awsS3')
  ? require('db/awsS3/aws-operations').validateAwsS3
  : null;
const json = dataSources.includes('json')
  ? require('db/json/fs-operations').validateJsonDb
  : null;
const oracledb = dataSources.includes('oracledb')
  ? require('db/oracledb/connection').validateOracleDb
  : null;

/** Validate database configuration */
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
        logger.error(err);
        process.exit(1);
      });
    } else {
      throw new Error(`Data source type: '${dataSourceType}' is not recognized.`);
    }
  });
};

export { validateDataSource };

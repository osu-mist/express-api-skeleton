import config from 'config';
import _ from 'lodash';
import oracledb from 'oracledb';

import { logger } from 'utils/logger';

const dbConfig = config.get('dataSources').oracledb;

process.on('SIGINT', () => process.exit());
oracledb.outFormat = oracledb.OBJECT;
oracledb.fetchAsString = [oracledb.DATE, oracledb.NUMBER];

/** Increase 1 extra thread for every 5 pools but no more than 128 */
const threadPoolSize = dbConfig.poolMax + (dbConfig.poolMax / 5);
process.env.UV_THREADPOOL_SIZE = threadPoolSize > 128 ? 128 : threadPoolSize;

/** Connection pool */
let pool;

/**
 * Create a pool of connection
 *
 * @returns {Promise} Promise object represents a pool of connections
 */
const createPool = async () => {
  /** Attributes to use from config file */
  const attributes = ['connectString', 'user', 'password', 'poolMin', 'poolMax', 'poolIncrement'];
  pool = await oracledb.createPool(_.pick(dbConfig, attributes));
};

/**
 * Get a connection from a created pool. Creates pool if it hasn't been created yet.
 *
 * @returns {Promise} Promise object represents a connection from created pool
 */
const getConnection = async () => {
  if (!pool) {
    await createPool();
  }
  return pool.getConnection();
};

/**
 * Validate database connection and throw an error if invalid
 *
 * @throws Throws an error if unable to connect to the database
 */
const validateOracleDb = async () => {
  let connection;
  try {
    connection = await getConnection();
    await connection.execute('SELECT 1 FROM DUAL');
  } catch (err) {
    logger.error(err);
    throw new Error('Unable to connect to Oracle database');
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

export {
  getConnection, validateOracleDb,
};

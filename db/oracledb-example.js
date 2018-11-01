const reqlib = require('app-root-path').require;
const config = require('config');
const _ = require('lodash');
const oracledb = require('oracledb');

const contrib = reqlib('/contrib/contrib');
const { apiResourceSerializer } = reqlib('/serializers/api-resources-serializer');

process.on('SIGINT', () => process.exit());

oracledb.outFormat = oracledb.OBJECT;
const dbConfig = config.get('database');
const { endpointUri } = config.get('server');

/**
 * @summary Increase 1 extra thread for every 5 pools but no more than 128
 */
const threadPoolSize = dbConfig.poolMax + (dbConfig.poolMax / 5);
process.env.UV_THREADPOOL_SIZE = threadPoolSize > 128 ? 128 : threadPoolSize;

/**
 * @summary Create a pool of connection
 * @returns {Promise} Promise object represents a pool of connections
 */
const poolPromise = oracledb.createPool(dbConfig);

/**
 * @summary Get a connection from created pool
 * @function
 * @returns {Promise} Promise object represents a connection from created pool
 */
const getConnection = () => new Promise(async (resolve, reject) => {
  poolPromise.then(async (pool) => {
    const connection = await pool.getConnection();
    resolve(connection);
  }).catch(err => reject(err));
});

/**
 * @summary Return a list of APIs
 * @function
 * @returns {Promise} Promise object represents a list of APIs
 */
const getApis = () => new Promise(async (resolve, reject) => {
  const connection = await getConnection();
  try {
    const { rows } = await connection.execute(contrib.getApis());
    const jsonapi = apiResourceSerializer(rows, endpointUri);
    resolve(jsonapi);
  } catch (err) {
    reject(err);
  } finally {
    connection.close();
  }
});

/**
 * @summary Return a specific API by unique ID
 * @function
 * @param {string} id
 * @returns {Promise} Promise object represents a specific API
 */
const getApiById = id => new Promise(async (resolve, reject) => {
  const connection = await getConnection();
  try {
    const { rows } = await connection.execute(contrib.getApiById(id), id);

    if (_.isEmpty(rows)) {
      resolve(undefined);
    } else if (rows.length > 1) {
      reject(new Error('Expect a single object but got multiple results.'));
    } else {
      const [row] = rows;
      const jsonapi = apiResourceSerializer(row, endpointUri);
      resolve(jsonapi);
    }
  } catch (err) {
    reject(err);
  } finally {
    connection.close();
  }
});

module.exports = { getApis, getApiById };

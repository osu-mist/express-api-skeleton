const config = require('config');
const oracledb = require('oracledb');

const dbConfig = config.get('database');

process.on('SIGINT', () => process.exit());
oracledb.outFormat = oracledb.OBJECT;
oracledb.fetchAsString = [oracledb.DATE, oracledb.NUMBER];

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

module.exports = { getConnection };

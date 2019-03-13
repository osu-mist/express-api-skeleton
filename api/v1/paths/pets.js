const appRoot = require('app-root-path');

const petsDao = require('../db/json/pets-dao-example');

const { errorHandler } = appRoot.require('errors/errors');
const { openapi: { paths } } = appRoot.require('utils/load-openapi');

/**
 * @summary Get pets
 */
const get = async (req, res) => {
  try {
    const result = await petsDao.getPets(req.query);
    return res.send(result);
  } catch (err) {
    return errorHandler(res, err);
  }
};

get.apiDoc = paths['/pets'].get;

module.exports = { get };

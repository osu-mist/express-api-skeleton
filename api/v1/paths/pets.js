const appRoot = require('app-root-path');

const { errorHandler } = appRoot.require('errors/errors');
const { openapi: { paths } } = appRoot.require('utils/load-openapi');
const petsDAO = require('../db/json/pets-dao-example');

/**
 * @summary Get pets
 */
const get = async (req, res) => {
  try {
    const result = await petsDAO.getPets(req.query);
    return res.send(result);
  } catch (err) {
    return errorHandler(res, err);
  }
};

get.apiDoc = paths['/pets'].get;

module.exports = { get };

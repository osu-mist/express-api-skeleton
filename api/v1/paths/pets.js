const appRoot = require('app-root-path');

const petsDAO = require('../db/json/pets-dao-example');

const { paths } = appRoot.require('app').locals.openapi;
const { errorHandler } = appRoot.require('errors/errors');

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

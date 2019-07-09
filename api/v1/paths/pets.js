const { errorHandler } = require('Errors/errors');
const { openapi: { paths } } = require('Utils/load-openapi');

const petsDao = require('../db/json/pets-dao-example');

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

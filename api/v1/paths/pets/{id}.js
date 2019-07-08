const { errorBuilder, errorHandler } = require('Errors/errors');
const { openapi: { paths } } = require('Utils/load-openapi');

const petsDao = require('../../db/json/pets-dao-example');

/**
 * @summary Get pet by unique ID
 */
const get = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await petsDao.getPetById(id);
    if (!result) {
      errorBuilder(res, 404, 'A pet with the specified ID was not found.');
    } else {
      res.send(result);
    }
  } catch (err) {
    errorHandler(res, err);
  }
};

get.apiDoc = paths['/pets/{id}'].get;

module.exports = { get };

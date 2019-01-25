const appRoot = require('app-root-path');

const petsDAO = require('../../db/json/pets-dao-example');

const { paths } = appRoot.require('app').locals.openapi;
const { errorBuilder, errorHandler } = appRoot.require('errors/errors');

/**
 * @summary Get pet by unique ID
 */
const get = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await petsDAO.getPetById(id);
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

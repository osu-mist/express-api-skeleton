const appRoot = require('app-root-path');

const petsDao = require('../../db/json/pets-dao-example');

const { errorBuilder, errorHandler } = appRoot.require('errors/errors');

/**
 * Get pet by unique ID
 *
 * @type RequestHandler
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

module.exports = { get };

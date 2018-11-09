const appRoot = require('app-root-path');
const fs = require('fs');
const yaml = require('js-yaml');

const { notFound, errorHandler } = appRoot.require('errors/errors');
const petsDAO = require('../../db/json/pets-dao-example');

const { paths } = yaml.safeLoad(fs.readFileSync(`${appRoot}/openapi.yaml`, 'utf8'));

/**
 * @summary Get pet by unique ID
 */
const get = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await petsDAO.getPetById(id);
    if (!result) {
      res.status(404).send(notFound('A pet with the specified ID was not found.'));
    } else {
      res.send(result);
    }
  } catch (err) {
    errorHandler(res, err);
  }
};

get.apiDoc = paths['/pets/{id}'].get;

module.exports = { get };

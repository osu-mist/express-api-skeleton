const appRoot = require('app-root-path');
const fs = require('fs');
const yaml = require('js-yaml');

const db = appRoot.require('/db/json/apis-dao-example');
const { notFound, errorHandler } = appRoot.require('/errors/errors');
const { paths } = yaml.safeLoad(fs.readFileSync(`${appRoot}/openapi.yaml`, 'utf8'));

/**
 * @summary Get API by unique ID
 */
const get = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.getApiById(id);
    if (!result) {
      res.status(404).send(notFound('An API with the specified ID was not found.'));
    } else {
      res.send(result);
    }
  } catch (err) {
    errorHandler(res, err);
  }
};

get.apiDoc = paths['/express-api-skeleton/{id}'].get;

module.exports = { get };

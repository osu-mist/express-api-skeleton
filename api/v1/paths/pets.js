const appRoot = require('app-root-path');

const petsDao = require('../db/json/pets-dao-example');

const { errorHandler } = appRoot.require('errors/errors');

/**
 * Get pets
 *
 * @type {RequestHandler}
 */
const get = async (req, res) => {
  try {
    const result = await petsDao.getPets(req.query);
    return res.send(result);
  } catch (err) {
    return errorHandler(res, err);
  }
};

/**
 * Post pets
 *
 * @type {RequestHandler}
 */
const post = async (req, res) => {
  try {
    const result = await petsDao.postPet(req.body);
    res.set('Location', result.data.links.self);
    res.status(201).send(result);
  } catch (err) {
    errorHandler(res, err);
  }
};

module.exports = { get, post };

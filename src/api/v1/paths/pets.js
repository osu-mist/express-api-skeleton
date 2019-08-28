import { errorHandler } from 'errors/errors';
import { getPets, postPet } from '../db/json/pets-dao-example';

/**
 * Get pets
 *
 * @type {RequestHandler}
 */
const get = async (req, res) => {
  try {
    const result = await getPets(req.query);
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
    const result = await postPet(req.body);
    res.set('Location', result.data.links.self);
    res.status(201).send(result);
  } catch (err) {
    errorHandler(res, err);
  }
};


export {
  get,
  post,
};

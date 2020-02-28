import { errorHandler } from 'errors/errors';
import { getPets, postPet } from '../db/json/pets-dao-example';
import { serializePet, serializePets } from '../serializers/pets-serializer';

/**
 * Get pets
 *
 * @type {RequestHandler}
 */
const get = async (req, res) => {
  try {
    const rawPets = await getPets(req.query);
    const result = serializePets(rawPets, req);
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
    const rawPet = await postPet(req.body);
    const result = serializePet(rawPet, req);
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

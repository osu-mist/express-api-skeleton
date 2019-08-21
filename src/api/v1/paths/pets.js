import { errorHandler } from 'errors/errors';
import { getPets } from '../db/json/pets-dao-example';

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

export default {
  get,
};

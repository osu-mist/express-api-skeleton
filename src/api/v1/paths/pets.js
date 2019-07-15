import { getPets } from '../db/json/pets-dao-example';

import { errorHandler } from 'Errors/errors';

/**
 * @summary Get pets
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

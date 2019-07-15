import { getPetById } from '../../db/json/pets-dao-example';

import { errorBuilder, errorHandler } from 'Errors/errors';

/**
 * @summary Get pet by unique ID
 */
const get = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getPetById(id);
    if (!result) {
      errorBuilder(res, 404, 'A pet with the specified ID was not found.');
    } else {
      res.send(result);
    }
  } catch (err) {
    errorHandler(res, err);
  }
};

export default {
  get,
};

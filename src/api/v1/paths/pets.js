import { getPets } from '../db/json/pets-dao-example';

import { errorHandler } from 'errors/errors';
import openapi from 'utils/load-openapi';

const { paths } = openapi;

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

get.apiDoc = paths['/pets'].get;

export { get as default };

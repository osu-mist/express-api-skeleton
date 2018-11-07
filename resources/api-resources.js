const appRoot = require('app-root-path');

const db = appRoot.require('/db/json/apis-dao-example');
const { badRequest, notFound, errorHandler } = appRoot.require('/errors/errors');

/**
 * @summary Get APIs
 */
const getApis = async (req, res) => {
  try {
    const MAX_PAGE_SIZE = 500;
    const { page } = req.query;
    /**
     * Return 400 errors if page[size]/page[number] are not valid
     */
    if (page) {
      const { size, number } = page;
      const isInvalidSize = (size !== '') && (size <= 0 || size > MAX_PAGE_SIZE);
      const isInvalidNumber = (number !== '') && number <= 0;
      const errors = [];

      if (isInvalidSize || isInvalidNumber) {
        if (isInvalidSize) errors.push(`page[size] should an integer between 1 to ${MAX_PAGE_SIZE}.`);
        if (isInvalidNumber) errors.push('page[number] should an integer starts at 1.');
        return res.status(400).send(badRequest(errors));
      }
    }

    const result = await db.getApis(req.query);
    return res.send(result);
  } catch (err) {
    return errorHandler(res, err);
  }
};

/**
 * @summary Get API by unique ID
 */
const getApiById = async (req, res) => {
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

module.exports = { getApis, getApiById };

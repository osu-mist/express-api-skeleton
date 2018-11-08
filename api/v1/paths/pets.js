const appRoot = require('app-root-path');
const fs = require('fs');
const yaml = require('js-yaml');

const db = appRoot.require('db/json/apis-dao-example');
const { badRequest, errorHandler } = appRoot.require('errors/errors');

const { paths } = yaml.safeLoad(fs.readFileSync(`${appRoot}/openapi.yaml`, 'utf8'));

/**
 * @summary Get APIs
 */
const get = async (req, res) => {
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
        res.status(400).send(badRequest(errors));
      }
    }

    const result = await db.getApis(req.query);
    res.send(result);
  } catch (err) {
    errorHandler(res, err);
  }
};

get.apiDoc = paths['/pets'].get;

module.exports = { get };

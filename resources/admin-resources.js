const appRoot = require('app-root-path');
const fs = require('fs');
const yaml = require('js-yaml');
const moment = require('moment');
const git = require('simple-git/promise');

const { errorHandler } = appRoot.require('/errors/errors');

const { info: { title } } = yaml.safeLoad(fs.readFileSync(`${appRoot}/openapi.yaml`, 'utf8'));

/**
 * @summary Get application information
 */
const getApplicationInfo = async (req, res) => {
  try {
    const commit = await git().revparse(['--short', 'HEAD']);
    const now = moment();
    const info = {
      meta: {
        name: title,
        time: now.format('YYYY-MM-DD HH:mm:ssZZ'),
        unixTime: now.unix(),
        commit: commit.trim(),
        documentation: 'swagger.yaml',
      },
    };
    res.send(info);
  } catch (err) {
    errorHandler(res, err);
  }
};

module.exports = { getApplicationInfo };

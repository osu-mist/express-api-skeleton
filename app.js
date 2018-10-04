const appRoot = require('app-root-path');
const config = require('config');
const express = require('express');
const fs = require('fs');
const yaml = require('js-yaml');
const _ = require('lodash');
const git = require('simple-git/promise');
const https = require('https');
const moment = require('moment');

const db = appRoot.require('/db/db');
const { badRequest, notFound, errorHandler } = appRoot.require('/errors/errors');
const { authentication } = appRoot.require('/middlewares/authentication');
const { logger } = appRoot.require('/middlewares/logger');
const api = appRoot.require('/package.json').name;
const {
  port,
  adminPort,
  keyPath,
  certPath,
  secureProtocol,
} = config.get('server');
const { basePath } = yaml.safeLoad(fs.readFileSync(`${appRoot}/swagger.yaml`, 'utf8'));

/**
 * @summary Initialize Express applications and routers
 */
const app = express();
const appRouter = express.Router();
const adminApp = express();
const adminAppRouter = express.Router();

/**
 * @summary Middlewares
 */
if (logger) app.use(logger);
app.use(`/api${basePath}`, appRouter);
appRouter.use(authentication);

adminApp.use(`/api${basePath}`, adminAppRouter);
adminAppRouter.use(authentication);
adminAppRouter.use('/healthcheck', require('express-healthcheck')());

/**
 * @summary Get application information
 */
adminAppRouter.get('/', async (req, res) => {
  try {
    const commit = await git().revparse(['--short', 'HEAD']);
    const now = moment();
    const info = {
      meta: {
        name: 'express-api-skeleton',
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
});

/**
 * @summary Get APIs
 */
appRouter.get(`/${api}`, async (req, res) => {
  try {
    const { isPaginated, maxPageSize } = config.get('pagination');
    const { query } = req;

    if (isPaginated && query.page) {
      _.forEach(query.page, (value, key) => {
        query.page[key] = parseInt(value, 10);
      });
      const { size, number } = query.page;
      const isInvalidSize = size && (!Number.isInteger(size) || size <= 0 || size > maxPageSize);
      const isInvalidNumber = number && (!Number.isInteger(number) || number <= 0);
      const errors = [];

      if (isInvalidSize || isInvalidNumber) {
        if (isInvalidSize) errors.push(`page[size] should an integer between 1 to ${maxPageSize}.`);
        if (isInvalidNumber) errors.push('page[number] should an integer starts at 1.');
        return res.status(400).send(badRequest(errors));
      }
    }

    const result = await db.getApis(query);
    return res.send(result);
  } catch (err) {
    return errorHandler(res, err);
  }
});

/**
 * @summary Get API by unique ID
 */
appRouter.get(`/${api}/:id`, async (req, res) => {
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
});

/**
 * @summary Create and start HTTPS servers
 */
const httpsOptions = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
  secureProtocol,
};
const httpsServer = https.createServer(httpsOptions, app);
const adminHttpsServer = https.createServer(httpsOptions, adminApp);

httpsServer.listen(port);
adminHttpsServer.listen(adminPort);

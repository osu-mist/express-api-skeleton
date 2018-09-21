const reqlib = require('app-root-path').require;
const config = require('config');
const express = require('express');
const fs = require('fs');
const git = require('simple-git/promise');
const https = require('https');
const moment = require('moment');

const db = reqlib('/db/db');
const { notFound, errorHandler } = reqlib('/errors/errors');
const { authentication } = reqlib('/middlewares/authentication');
const { logger } = reqlib('/middlewares/logger');
const api = reqlib('/package.json').name;
const {
  basePath,
  port,
  adminPort,
  keyPath,
  certPath,
  secureProtocol,
} = config.get('server');

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
app.use(basePath, appRouter);
appRouter.use(authentication);

adminApp.use(basePath, adminAppRouter);
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
        documentation: 'openapi.yaml',
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
    const result = await db.getApis();
    res.send(result);
  } catch (err) {
    errorHandler(res, err);
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

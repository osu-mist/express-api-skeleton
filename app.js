const reqlib = require('app-root-path').require;
const config = require('config');
const express = require('express');
const fs = require('fs');
const git = require('simple-git/promise');
const https = require('https');
const moment = require('moment');

const { errorHandler } = reqlib('/errors/errors');
const { authentication } = reqlib('/middlewares/authentication');
const { logger } = reqlib('/middlewares/logger');

// Create Express application
const serverConfig = config.get('server');
const app = express();
const appRouter = express.Router();
const adminApp = express();
const adminAppRouter = express.Router();

// Middlewares
if (logger) app.use(logger);
app.use(serverConfig.basePath, appRouter);
appRouter.use(authentication);

adminApp.use(serverConfig.basePath, adminAppRouter);
adminAppRouter.use(authentication);
adminAppRouter.use('/healthcheck', require('express-healthcheck')());

// GET /
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

// Create and start HTTPS servers
const httpsOptions = {
  key: fs.readFileSync(serverConfig.keyPath),
  cert: fs.readFileSync(serverConfig.certPath),
  secureProtocol: serverConfig.secureProtocol,
};
const httpsServer = https.createServer(httpsOptions, app);
const adminHttpsServer = https.createServer(httpsOptions, adminApp);

httpsServer.listen(serverConfig.port);
adminHttpsServer.listen(serverConfig.adminPort);

module.exports = { app };

const appRoot = require('app-root-path');
const config = require('config');
const express = require('express');
const { initialize } = require('express-openapi');
const fs = require('fs');
const https = require('https');
const yaml = require('js-yaml');
const moment = require('moment');
const git = require('simple-git/promise');

const { errorHandler } = appRoot.require('/errors/errors');
const { authentication } = appRoot.require('/middlewares/authentication');
const { logger } = appRoot.require('/middlewares/logger');

const serverConfig = config.get('server');
const openapi = yaml.safeLoad(fs.readFileSync(`${appRoot}/openapi.yaml`, 'utf8'));

/**
 * @summary Initialize Express applications and routers
 */
const app = express();
const appRouter = express.Router();
const adminApp = express();
const adminAppRouter = express.Router();

/**
 * @summary Create and start HTTPS servers
 */
const httpsOptions = {
  key: fs.readFileSync(serverConfig.keyPath),
  cert: fs.readFileSync(serverConfig.certPath),
  secureProtocol: serverConfig.secureProtocol,
};
const httpsServer = https.createServer(httpsOptions, app);
const adminHttpsServer = https.createServer(httpsOptions, adminApp);

/**
 * @summary Middlewares for routers, logger and authentication
 */
const baseEndpoint = `${serverConfig.basePathPrefix}`;
app.use(baseEndpoint, appRouter);
adminApp.use(baseEndpoint, adminAppRouter);

appRouter.use(logger);
appRouter.use(authentication);
adminAppRouter.use(authentication);

/**
 * @summary Middlewares sub-stack that handles HTTP requests to paths
 */
adminAppRouter.get(`${openapi.basePath}`, async (req, res) => {
  try {
    const commit = await git().revparse(['--short', 'HEAD']);
    const now = moment();
    const info = {
      meta: {
        name: openapi.info.title,
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
 * @summary Initialize API with OpenAP specification
 */
initialize({
  app: appRouter,
  apiDoc: openapi,
  paths: './api/v1/paths',
});

console.log(adminAppRouter.stack);

/**
 * @summary Start servers and listen on ports
 */
httpsServer.listen(serverConfig.port);
adminHttpsServer.listen(serverConfig.adminPort);

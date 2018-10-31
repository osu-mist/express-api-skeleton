const appRoot = require('app-root-path');
const config = require('config');
const express = require('express');
const fs = require('fs');
const yaml = require('js-yaml');
const https = require('https');

const adminResources = appRoot.require('resources/admin-resources');
const apiResources = appRoot.require('resources/api-resources');
const { authentication } = appRoot.require('/middlewares/authentication');
const { logger } = appRoot.require('/middlewares/logger');
const api = appRoot.require('/package.json').name;

const {
  port,
  adminPort,
  basePathPrefix,
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
 * @summary Middlewares for routers, logger and authentication
 */
const baseEndpoint = `${basePathPrefix}${basePath}`;
app.use(baseEndpoint, appRouter);
adminApp.use(baseEndpoint, adminAppRouter);

appRouter.use(logger);
appRouter.use(authentication);
adminAppRouter.use(authentication);

/**
 * @summary Middlewares sub-stack that handles HTTP requests to paths
 */
adminAppRouter.get('/', adminResources.getApplicationInfo);

appRouter.get(`/${api}`, apiResources.getApis);
appRouter.get(`/${api}/:id`, apiResources.getApiById);

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

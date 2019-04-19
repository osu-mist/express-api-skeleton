const appRoot = require('app-root-path');
const bodyParser = require('body-parser');
const { compose } = require('compose-middleware');
const config = require('config');
const express = require('express');
const { initialize } = require('express-openapi');
const fs = require('fs');
const https = require('https');
const moment = require('moment');
const git = require('simple-git/promise');

const { errorBuilder, errorHandler } = appRoot.require('errors/errors');
const { authentication } = appRoot.require('middlewares/authentication');
const { bodyParserError } = appRoot.require('middlewares/body-parser-error');
const { logger } = appRoot.require('middlewares/logger');
const { runtimeErrors } = appRoot.require('middlewares/runtime-errors');
const { openapi } = appRoot.require('utils/load-openapi');
const { validateDataSource } = appRoot.require('utils/validate-data-source');

const serverConfig = config.get('server');

validateDataSource();

/**
 * @summary Initialize Express applications and routers
 */
const app = express();
const appRouter = express.Router();
const adminApp = express();
const adminAppRouter = express.Router();

/**
 * @summary Use the simple query parser to prevent the parameters which contain square brackets
 * be parsed as a nested object
 */
app.set('query parser', 'simple');

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
 * @summary Function that handles transforming openapi errors
 * @function
 */
const errorTransformer = (openapiError, ajvError) => {
  /**
   * express-openapi will add a leading '[' and closing ']' to the 'path' field if the parameter
   * name contains '[' or ']'. This regex is used to remove them to keep the path name consistent.
   * @type {RegExp}
   */
  const pathQueryRegex = /\['(.*)']/g;

  const error = Object.assign({}, openapiError, ajvError);

  const regexResult = pathQueryRegex.exec(error.path);
  error.path = regexResult ? regexResult[1] : error.path;
  return error;
};

/**
 * @summary Return API meta information at admin endpoint
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
        documentation: 'openapi.yaml',
      },
    };
    res.send(info);
  } catch (err) {
    errorHandler(res, err);
  }
});

/**
 * @summary Initialize API with OpenAPI specification
 */
initialize({
  app: appRouter,
  apiDoc: openapi,
  paths: `${appRoot}/api${openapi.basePath}/paths`,
  consumesMiddleware: {
    'application/json': compose([bodyParser.json(), bodyParserError]),
  },
  errorMiddleware: runtimeErrors,
  errorTransformer,
});

/**
 * @summary Return a 404 error if resource not found
 */
appRouter.use((req, res) => errorBuilder(res, 404, 'Resource not found.'));

/**
 * @summary Start servers and listen on ports
 */
httpsServer.listen(serverConfig.port);
adminHttpsServer.listen(serverConfig.adminPort);

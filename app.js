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
const SwaggerParser = require('swagger-parser');

const { errorBuilder, errorHandler } = appRoot.require('errors/errors');
const { authentication } = appRoot.require('middlewares/authentication');
const { errorMiddleware } = appRoot.require('middlewares/error-middleware');
const { logger } = appRoot.require('middlewares/logger');

const serverConfig = config.get('server');

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
 * @summary Middleware that improves the error message when failing to parse JSON
 * @function
 */
const bodyParserErrorHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError) {
    err.customStatus = 400;
    err.customMessage = `Error parsing JSON: ${err}`;
  }
  next(err);
};

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
 * @summary Handles general startup for the app
 * @function
 */
const startup = async () => {
  /**
   * @summary Validate and parse openapi document. Store the openapi object in
   * app.locals.openapi for use by other modules.
   */
  await SwaggerParser.validate('openapi.yaml').then((openapi) => {
    app.locals.openapi = openapi;
  }).catch((err) => {
    console.error(`Error parsing openapi.yaml: ${err}`);
    process.exit(1);
  });

  /**
   * @summary Return API meta information at admin endpoint
   */
  adminAppRouter.get(`${app.locals.openapi.basePath}`, async (req, res) => {
    try {
      const commit = await git().revparse(['--short', 'HEAD']);
      const now = moment();
      const info = {
        meta: {
          name: app.locals.openapi.info.title,
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
    apiDoc: app.locals.openapi,
    paths: `${appRoot}/api/v1/paths`,
    consumesMiddleware: {
      'application/json': compose([bodyParser.json(), bodyParserErrorHandler]),
    },
    errorMiddleware,
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
};

startup();

module.exports = { locals: app.locals };

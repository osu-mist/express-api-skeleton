# Express API Skeleton ![version](https://img.shields.io/badge/version-v2-blue.svg) [![openapi](https://img.shields.io/badge/openapi-3-green.svg)](./openapi.yaml) ![node](https://img.shields.io/badge/node-10.17-brightgreen.svg) ![npm](https://img.shields.io/badge/npm-6.11.1-orange.svg)

Skeleton for Express APIs. API definition is contained in the [OpenAPI specification](./openapi.yaml).

## Getting Started

### Prerequisites

1. Install Node.js from [nodejs.org](https://nodejs.org/en/).
2. Generate a self signed certificate with [OpenSSL](https://www.openssl.org/):

    ```shell
    $ openssl req -newkey rsa:2048 -new -nodes -keyout key.pem -out csr.pem
    $ openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out server.crt
    ```

3. Document API design in [openapi.yaml](./openapi.yaml). Please keep in mind that openapi documentation is mainly for the client's view. Directly implement the feature in the API if there is any difference between what the client should expect and what our server should provide.
4. Copy [config/default-example.yaml](config/default-example.yaml) to `config/default.yaml`. Modify as necessary, being careful to avoid committing sensitive data. If you want to configure application through [custom environment variables](https://github.com/lorenwest/node-config/wiki/Environment-Variables#custom-environment-variables), copy [config/custom-environment-variables-example.yaml](config/custom-environment-variables-example.yaml) as `config/custom-environment-variables.yaml` and map the environment variable names into your configuration structure.

    **Environment variables**: Sensitive data and data that changes per environment have been moved into environment variables. Below is a list of the variables along with a definition:

    | Environment variable | Description |
    | -------------------- | ----------- |
    | `${API_HOSTNAME}` | API hostname. |
    | `${API_PORT}` | The port used by the API. |
    | `${API_ADMIN_PORT}` | The port used by the **ADMIN** endpoint. |
    | `${API_USER}` | The HTTP Basic username used to authenticate API calls. |
    | `${API_PASSWD}` | The HTTP Basic password used to authenticate API calls. |

5. Copy [mock-db/mock-data-example.json](mock-db/mock-data-example.yaml) to `mock-db/mock-data.json`. This will serve as the JSON DB, which is not committed to source code as it will change as the POST endpoint is used.

### Installing

```shell
$ npm install
```

### Usage

Run the application:

  ```shell
  # Build and run the app and watch for changes using nodemon
  $ npm run dev

  # Run the app without building
  $ npm start
  ```

## Running the tests

### Linting

Run [ESLint](https://eslint.org/) to check the code:

```shell
# Using gulp
$ gulp lint

# Using npm
$ npm run lint
```

> Note: We use [Airbnb's style](https://github.com/airbnb/javascript) as a base style guide.
> Additional rules and modifications can be found in [.eslintrc.yml](./.eslintrc.yml).

### Testing

Run unit tests:

```shell
# Using gulp
$ gulp test

# Using npm
$ npm test
```

### Test Coverage

Run the nyc tool against the unit tests:

```shell
# Using npm
$ npm run coverage
```

After task is run, a more detailed test coverage report will be available by opening `./coverage/lcov-report/index.html` in your browser.

### Type checking

This API is configured to use [Flow static type checking](https://flow.org/).

Check flow types:

```shell
# Using gulp
$ gulp typecheck

# Using npm
$ npm run typecheck
```

## Babel

This API uses [Babel](https://babeljs.io/) to transpile JavaScript code. After running, the transpiled code will be located in `dist/`. Source maps are also generated in the same directory. These contain references to the original source code for debugging purposes.

Babel allows for newer ECMAScript syntax such as `import` and `export` from ES6. It also allows [Babel plugins](https://babeljs.io/docs/en/plugins) to be used.

Compilation is done by the `babel` gulp task. This is handled automatically by other tasks but can be manually invoked:

```shell
# Using gulp
$ gulp babel

# Using npm
$ npm run babel
```

### Resolving Paths

This skeleton uses
[babel-plugin-module-resolver](https://github.com/tleunen/babel-plugin-module-resolver) to resolve
paths. The list of functions that use this plugin can be found in
[babel.config.js](./babel.config.js) under `transformFunctions`.

> Note: `proxyquire` is included but only the path given by the first argument to this function will
> resolve correctly. The keys for each dependency path in the second argument must be relative
> paths.

## Base project off the skeleton

### Base a new project off the skeleton

1. Clone the skeleton:

    ```shell
    $ git clone --origin skeleton git@github.com:osu-mist/express-api-skeleton.git <my-api>
    ```

2. Rename project by modifying [package.json](./package.json).

3. We use [express-openapi](https://www.npmjs.com/package/express-openapi) to generate API by inheriting openapi.yaml. Create path handlers and put them into corresponding directories. For example:

    * The path handler for `/pets` should go to [src/api-routes/pet.js](./src/api-routes/pet.js)
    * The path handler for `/pets/{id}` should go to [src/api-routes/{id}.js](./src/api-routes/pet/{id}.js)

4. Copy [src/serializers/pets-serializer.js](./src/serializers/pets-serializer.js) to `src/serializers/<resources>-serializer.js` and modify as necessary:

    ```shell
    $ cp src/serializers/pets-serializer.js src/serializers/<resources>-serializer.js
    ```

### Base an existing project off / Incorporate updates from the skeleton

1. Add the skeleton as a remote:

    ```shell
    $ git remote add skeleton git@github.com:osu-mist/express-api-skeleton.git
    ```

2. Fetch updates from the skeleton:

    ```shell
    $ git fetch skeleton
    ```

3. Merge the skeleton into your codebase:

    ```shell
    $ git checkout feature/CO-1234-branch
    $ git merge skeleton/master
    $ git commit -v
    ```

## Getting data source from HTTP endpoints

The following instructions show you how to get data from external endpoints for use in the API.

1. Define `dataSources/http` section in the `/config/default.yaml` to be like:

    ```yaml
    dataSources:
      dataSources: ['http']
      http:
        url: 'https://api.example.com'
    ```

2. Copy [src/db/http/pets-dao-example.js](./src/db/http/pets-dao-example.js) to `src/db/http/<resources>-dao.js` and modify as necessary:

    ```shell
    $ cp src/db/http/pets-dao-example.js src/db/http/<resources>-dao.js
    ```

3. Make sure to use the correct path for the new DAO file at path handlers files:

    ```js
    import petsDao from '../db/http/<resources>-dao';
    ```

## Getting data source from the Oracle Database

The following instructions show you how to connect the API to an Oracle database.

1. Install [Oracle Instant Client](http://www.oracle.com/technetwork/database/database-technologies/instant-client/overview/index.html) by following [this installation guide](https://oracle.github.io/odpi/doc/installation.html). **IMPORTANT:** Download the Basic Package, not the Basic Light Package.

2. Define `dataSources/oracledb` section in the `/config/default.yaml` to be like:

    ```yaml
    dataSources:
      dataSources: ['oracledb']
      oracledb:
        connectString: 'DB_URL'
        user: 'DB_USER'
        password: 'DB_PASSWD'
        poolMin: 4
        poolMax: 4
        poolIncrement: 0:
    ```

    **Options for database configuration**:

    | Option | Description |
    | ------ | ----------- |
    | `poolMin` | The minimum number of connections a connection pool maintains, even when there is no activity to the target database. |
    | `poolMax` | The maximum number of connections that can be open in the connection pool. |
    | `poolIncrement` | The number of connections that are opened whenever a connection request exceeds the number of currently open connections. |

    > Note: To avoid `ORA-02396: exceeded maximum idle time` and prevent deadlocks, the [best practice](https://github.com/oracle/node-oracledb/issues/928#issuecomment-398238519) is to keep `poolMin` the same as `poolMax`. Also, ensure [increasing the number of worker threads](https://github.com/oracle/node-oracledb/blob/node-oracledb-v1/doc/api.md#-82-connections-and-number-of-threads) available to node-oracledb. The thread pool size should be at least equal to the maximum number of connections and less than 128.

3. If the SQL codes/queries contain intellectual property like Banner table names, put them into `src/db/oracledb/contrib` folder and use [git-submodule](https://git-scm.com/docs/git-submodule) to manage submodules:

    * Add the given repository as a submodule at `src/db/oracledb/contrib`:

        ```shell
        $ git submodule add <contrib_repo_git_url> src/db/oracledb/contrib
        ```

    * Fetch the submodule from the contrib repository:

        ```shell
        $ git submodule update --init
        ```

4. Copy [src/db/oracledb/pets-dao-example.js](./src/db/oracledb/pets-dao-example.js) to `src/db/oracledb/<resources>-dao.js` and modify as necessary:

    ```shell
    $ cp src/db/oracledb/pets-dao-example.js src/db/oracledb/<resources>-dao.js
    ```

5. Make sure to use the correct path for the new DAO file at path handlers files:

    ```js
    import petsDao from '../db/oracledb/<resources>-dao';
    ```

## Getting data source from an AWS S3 bucket

The following instructions show you how to get data from an AWS S3 bucket

1. Install [aws-sdk](https://www.npmjs.com/package/aws-sdk) via package management:

    ```shell
    $ npm install aws-sdk
    ```

2. Define the `dataSources` field in `config/default.yaml` to be like:

    ```yaml
    dataSources:
      dataSources: ['awsS3']
      awsS3:
        bucket: BUCKET_NAME
        apiVersion: API_VERSION
        accessKeyId: ACCESS_KEY_ID
        secretAccessKey: SECRET_ACCESS_KEY
        region: REGION
        endpoint: null
        s3ForcePathStyle: false
    ```

    **Options for configuration**:

    | Option | Description |
    | ------ | ----------- |
    | `bucket` | The name of the AWS S3 bucket to use |
    | `apiVersion` | Version of the S3 API. Example: `'2006-03-01'` |
    | `endpoint` | When using a local or proxy S3 instance, set this value to the host URL. Example: `http://localhost:9000` |
    | `s3ForcePathStyle` | Set to `true` if using a local or proxy S3 instance |

3. Copy [src/db/awsS3/pets-dao-example.js](./src/db/awsS3/pets-dao-example.js) to `src/db/awsS3/<resources>-dao.js` and modify as necessary:

    ```shell
    $ cp src/db/awsS3/pets-dao-example.js src/db/awsS3/<resources>-dao.js
    ```

4. Make sure to use the correct path for the new DAO file at path handlers files:

    ```js
    import petsDao from '../db/awsS3/<resources>-dao';
    ```

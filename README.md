# Express API Skeleton ![version](https://img.shields.io/badge/version-v1-blue.svg) [![swagger](https://img.shields.io/badge/swagger-2.0-green.svg)](./swagger.yaml)

Skeleton for Express APIs. API definition is contained in the [Swagger specification](./swagger.yaml).

## Getting Started

### Prerequisites

1. Install Node.js from [nodejs.org](https://nodejs.org/en/).
2. Generate a self signed certificate with [OpenSSL](https://www.openssl.org/):

    ```shell
    $ openssl req -newkey rsa:2048 -new -nodes -keyout key.pem -out csr.pem
    $ openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out server.crt
    ```

3. Document API design in [swagger.yaml](./swagger.yaml). Please keep in mind that swagger documentation is mainly for client's view. If there is any difference between client should expect and our server should provide, directly implement the feature in the API.
4. Copy [config/default-example.yaml](config/default-example.yaml) to `config/default.yaml`. Modify as necessary, being careful to avoid committing sensitive data. If you want to configure application through [custom environment variables](https://github.com/lorenwest/node-config/wiki/Environment-Variables#custom-environment-variables), copy [config/custom-environment-variables-example.yaml](config/custom-environment-variables-example.yaml) as `config/custom-environment-variables.yaml` and map the environment variable names into your configuration structure.

    **Environment variables**: Sensitive data and data that changes per environment have been moved into environment variables. Below is a list of the variables along with a definition:

    | Environment variable | Description |
    | -------------------- | ----------- |
    | **${API_HOSTNAME}** | API hostname. |
    | **${API_PORT}** | The port used by the API. |
    | **${API_ADMIN_PORT}** | The port used by the **ADMIN** endpoint. |
    | **${API_USER}** | The HTTP Basic username used to authenticate API calls. |
    | **${API_PASSWD}** | The HTTP Basic password used to authenticate API calls. |

    **Options for logger configuration**:

    | Option | Description |
    | ------ | ----------- |
    | **size** | Maximum size of the file after which it will rotate. This can be a number of bytes, or units of kb, mb, and gb. If using the units, add 'k', 'm', or 'g' as the suffix. The units need to directly follow the number. |
    | **path** | The directory name to save log files to. |
    | **pattern** | A string representing the [moment.js date format](https://momentjs.com/docs/#/displaying/format/) to be used for rotating. The meta characters used in this string will dictate the frequency of the file rotation. For example, if your datePattern is simply 'HH' you will end up with 24 log files that are picked up and appended to every day. |
    | **archive** | A boolean to define whether or not to gzip archived log files. |

### Installing

```shell
# Using yarn (recommended)
$ yarn

# Using npm
$ npm install
```

### Usage

Run the application:

  ```shell
  # Run linting and testing tasks before starting the app
  $ gulp run

  # Run the app without running linting and testing tasks (only for development)
  $ gulp start
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

> Note: We are following [Airbnb's style](https://github.com/airbnb/javascript) as the JavaScript style guide.

### Testing

Run unit tests:

```shell
# Using gulp
$ gulp test

# Using npm
$ npm test
```

## Base project off the skeleton

### Base a new project off the skeleton

1. Clone the skeleton:

    ```shell
    $ git clone --origin skeleton git@github.com:osu-mist/express-api-skeleton.git <my-api>
    ```

2. Rename project by modifying [package.json](./package.json).

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

1. Configure data source section in the `/config/default.yaml`. For example:

    ```yaml
    httpDataSource:
        url: 'https://api.example.com'
    ```

2. Rename [db/http-datasource-example.js](db/http-datasource-example.js) to `db/db.js` and modify as necessary:

    ```shell
    $ git mv db/http-datasource-example.js db/db.js
    ```

3. Don't forget to change [serializers/jsonapi.js](serializers/jsonapi.js) to serialize data properly.

## Getting data source from the Oracle Database

The following instructions show you how to connect the API to an Oracle database.

1. Install [Oracle Instant Client](http://www.oracle.com/technetwork/database/database-technologies/instant-client/overview/index.html) by following [this installation guide](https://oracle.github.io/odpi/doc/installation.html).


2. Install [node-oracledb](https://oracle.github.io/node-oracledb/) via package management:

    ```shell
    # Using yarn (recommended)
    $ yarn add node-oracledb

    # Using npm
    $ npm install node-oracledb
    ```

3. Define `database` section in the `/config/default.yaml` to be like:

    ```yaml
    database:
      connectString: ${DB_URL}
      user: ${DB_USER}
      password: ${DB_PASSWD}
      poolMin: 30
      poolMax: 30
      poolIncrement: 0
    ```

    **Options for database configuration**:

    | Option | Description |
    | ------ | ----------- |
    | **poolMin** | The minimum number of connections a connection pool maintains, even when there is no activity to the target database. |
    | **poolMax** | The maximum number of connections that can be open in the connection pool. |
    | **poolIncrement** | The number of connections that are opened whenever a connection request exceeds the number of currently open connections. |

    > Note: To avoid `ORA-02396: exceeded maximum idle time` and prevent deadlocks, the [best practice](https://github.com/oracle/node-oracledb/issues/928#issuecomment-398238519) is to keep `poolMin` the same as `poolMax`. Also, ensure [increasing the number of worker threads](https://github.com/oracle/node-oracledb/blob/node-oracledb-v1/doc/api.md#-82-connections-and-number-of-threads) available to node-oracledb. The thread pool size should be at least equal to the maximum number of connections and less than 128.

4. If the SQL codes/queries contain intellectual property like Banner table names, put them into `./contrib` folder and use [git-submodule](https://git-scm.com/docs/git-submodule) to manage submodules:

    * Add the given repository as a submodule at `./contrib`:

        ```shell
        $ git submodule add <contrib_repo_git_url> contrib
        ```

    * Fetch the submodule from the contrib repository:

        ```shell
        $ git submodule update --init
        ```

5. Copy [db/oracledb-example.js](db/oracledb-example.js) to `db/db.js` and modify as necessary:

    ```shell
    $ git mv db/oracledb-example.js db/db.js
    ```

## Docker

[Dockerfile](Dockerfile) is also provided. To run the app in a container, install [Docker](https://www.docker.com/) first, then:

1. If the API is required [node-oracledb](https://oracle.github.io/node-oracledb/) to connect to an Oracle database, download an [Oracle Instant Client 12.2 Basic Light zip (64 bits)](http://www.oracle.com/technetwork/topics/linuxx86-64soft-092277.html) and place into `./bin` folder.

2. Build the docker image:

    ```shell
    $ docker build -t express-api-skeleton .
    ```

3. Run the app in a container:

    ```shell
    $ docker run -d \
                 -p 8080:8080 \
                 -p 8081:8081 \
                 -v path/to/keytools/:/usr/src/express-api-skeleton/keytools:ro \
                 -v "$PWD"/config:/usr/src/express-api-skeleton/config:ro \
                 -v "$PWD"/logs:/usr/src/express-api-skeleton/logs \
                 --name express-api-skeleton \
                 express-api-skeleton
    ```

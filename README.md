# Express API Skeleton

Skeleton for Express APIs.

## Getting Started

### Prerequisites

1. Install Node.js from [nodejs.org](https://nodejs.org/en/).
2. Generate a self signed certificate with [OpenSSL](https://www.openssl.org/):

    ```shell
    $ openssl req -newkey rsa:2048 -new -nodes -keyout key.pem -out csr.pem
    $ openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out server.crt
    ```

3. Copy [config/example.yaml](config/example.yaml) to `config/default.yaml`. Modify as necessary, being careful to avoid committing sensitive data.

    * **Environment variables**: Sensitive data and data that changes per environment has been moved into environment variables. Below is a list of the variables along with a definition:

        | Environment variable | Description |
        | -------------------- | ----------- |
        | **${PORT}** | The port used by the API. |
        | **${ADMIN_PORT}** | The port used by the **ADMIN** endpoint. |
        | **${USER}** | The HTTP Basic username used to authenticate API calls. |
        | **${PASSWD}** | The HTTP Basic password used to authenticate API calls. |
        | **${ENDPOINTURI}** | API endpoint URI. |

    * **Options for logger configuration**:

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
  # Run linting and testing tasks before start the app
  $ gulp run

  # Run the app without running linting and testing tasks (only for development)
  $ nodemon app.js
  ```

## Running the tests

### Linting

Run [ESLint](https://eslint.org/) to check the code:

```shell
# Using npm
$ npm run lint

# Using gulp
$ gulp lint
```

_Note: We are following [Airbnb's style](https://github.com/airbnb/javascript) as the JavaScript style guide_

### Testing

Run unit tests:

```shell
# Using npm
$ npm test

# Using gulp
$ gulp test
```

## Docker

[Dockerfile](Dockerfile) is also provided. To run the app in a container, install [Docker](https://www.docker.com/) first, then:

1. Build the docker image:

  ```shell
  $ docker build -t express-api-skeleton .
  ```

2. Run the app in a container:

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

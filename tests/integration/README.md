# Template of Integration Test ![python](https://img.shields.io/badge/python-3.7-blue.svg)

This directory contains template files that run integration tests against the API.

## Configuration

1. Register an application via [OSU Developer Portal](https://developer.oregonstate.edu/)
2. Get `client_id` and `client_secret` from your app, then copy
[configuration-example.json](./configuration-example.json) as `configuration.json` and modify it as necessary.

## Usage

1. Install dependencies via pip:

    ```shell
    $ pip install -r requirements.txt
    ```

2. Run the integration test:

    ```shell
    $ python integration.py -v --config path/to/configuration.json --openapi path/to/openapi.yaml
    ```

## Docker

Use these commands to build and run the tests in a container. All you need installed is Docker. **Make sure you are in the root directory of the repository**.

```shell
$ docker build -f tests/integration/Dockerfile -t <my-api>-integration-test .
$ docker run --rm \
             -v "$PWD"/tests/integration/configuration.json:/usr/src/app/configuration.json:ro \
             <my-api>-integration-test
```

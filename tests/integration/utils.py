import argparse
import json
import logging
import requests
import sys


def parse_arguments():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '--config',
        dest='config_path',
        help='Path to json formatted config file containing API credentials',
        required=True)
    parser.add_argument(
        '--openapi',
        dest='openapi_path',
        help='Path to yaml formatted OpenAPI specification',
        required=True)
    parser.add_argument(
        '--debug',
        dest='debug',
        help='Enable debug logging mode',
        action='store_true')
    arguments, unittest_args = parser.parse_known_args()
    return arguments, sys.argv[:1] + unittest_args


def setup_base_url(config):
    api = config['api']
    return api['local_base_url'] if config['local_test'] else api['base_url']


def setup_test_cases(config):
    test_cases = config['test_cases']
    return test_cases


def setup_session(config):
    session = requests.Session()

    if config['local_test']:
        basic_auth = config['auth']['basic_auth']
        session.auth = (basic_auth['username'], basic_auth['password'])
        session.verify = False
    else:
        oauth2 = config['auth']['oauth2']
        data = {
            'client_id': oauth2['client_id'],
            'client_secret': oauth2['client_secret'],
            'grant_type': 'client_credentials'
        }
        try:
            res = requests.post(url=oauth2['token_api_url'], data=data)
            token = res.json()['access_token']
        except KeyError:
            sys.exit('Error: invalid OAuth2 credentials')
        session.headers = {'Authorization': f'Bearer {token}'}
    return session


def get_json_content(self, response):
    # Response should in JSON format
    try:
        return response.json()
    except json.decoder.JSONDecodeError:
        self.fail('Response not in JSON format')


def get_resource_schema(self, resource):
    return self.openapi['definitions'][resource]['properties']


# Helper method to make a web request and lightly validate the response
def make_request(self, endpoint, expected_status_code,
                 params=None,
                 max_elapsed_seconds=5):

    requested_url = f'{self.base_url}{endpoint}'
    response = self.session.get(requested_url, params=params)
    logging.debug(f'Sent request to {requested_url}')

    # Response status code should be as expected
    status_code = response.status_code
    self.assertEqual(status_code, expected_status_code)

    # Response time should less then max_elapsed_seconds
    elapsed_seconds = response.elapsed.total_seconds()
    logging.debug(f'Request took {elapsed_seconds} second(s)')
    self.assertLess(elapsed_seconds, max_elapsed_seconds)

    return response


def check_schema(self, response, schema):
    def __get_schema_attributes():
        return schema['attributes']['properties']

    def __get_attribute_type(attribute):
        if 'properties' in attribute:
            return dict
        elif 'format' in attribute:
            openapi_type = attribute['format']
        elif 'type' in attribute:
            openapi_type = attribute['type']
        else:
            logging.warn('OpenAPI property contains no type or properties')
            return None

        types_dict = {
            'string': str,
            'integer': int,
            'int32': int,
            'int64': int,
            'float': float,
            'double': float,
            'boolean': bool,
            'array': list,
            'object': dict
        }
        return types_dict[openapi_type]

    def __check_resource_schema(resource):
        # Check resource type
        self.assertEqual(resource['type'], schema['type']['example'])

        # Check resource attributes
        actual_attributes = resource['attributes']
        expected_attributes = __get_schema_attributes()
        __check_attributes_schema(actual_attributes, expected_attributes)

    def __check_error_schema(error):
        # Check error attributes
        actual_attributes = error
        expected_attributes = schema
        __check_attributes_schema(actual_attributes, expected_attributes)

    def __check_attributes_schema(actual_attributes, expected_attributes):
        for field, actual_value in actual_attributes.items():
            expected_attribute = expected_attributes[field]
            expected_type = __get_attribute_type(expected_attribute)
            self.assertIsInstance(actual_value, expected_type)

    status_code = response.status_code
    content = get_json_content(self, response)

    # TODO: Add self-link testing
    # Basic tests for successful/error response
    try:
        if status_code == 200:
            resource_data = content['data']
            if isinstance(resource_data, list):
                for resource in resource_data:
                    __check_resource_schema(resource)
            else:
                __check_resource_schema(resource_data)
        elif status_code >= 400:
            errors_data = content['errors']
            self.assertIsInstance(errors_data, list)
            for error in errors_data:
                    __check_error_schema(error)
    except KeyError as error:
        self.fail(error)

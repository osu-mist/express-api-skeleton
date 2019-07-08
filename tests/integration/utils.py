import argparse
import json
import logging
import re
import requests
import sys
import textwrap
import urllib
import unittest


# Handler for parsing command-line arguments
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


# Setup base URL from configuration file
def setup_base_url(config):
    api = config['api']
    return api['local_base_url'] if config['local_test'] else api['base_url']


# Setup request session from configuration file
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


# Get response content in JSON format
def get_json_content(self, response):
    try:
        return response.json()
    except json.decoder.JSONDecodeError:
        self.fail('Response not in JSON format')


# Get resource schema from OpenAPI specification
def get_resource_schema(self, resource):
    return self.openapi['definitions'][resource]['properties']


# Helper function to make a web request and lightly validate the response
def make_request(self, endpoint, expected_status_code,
                 params=None,
                 max_elapsed_seconds=5):
    """
    Keyword arguments:
    * endpoint -- the endpoint to request
    * expected_status_code -- expected HTTP status code
    * params -- [optional] key-value pairs parameters (default: None)
    * max_elapsed_seconds -- [optional] maximum elapsed times (default: 5)
    Return:
    A response object contains a server’s response to an HTTP request
    """

    requested_url = f'{self.base_url}{endpoint}'
    response = self.session.get(requested_url, params=params)
    logging.debug(f'Sent request to {requested_url}, params = {params}')
    status_code = response.status_code
    response_code_details = textwrap.dedent(f'''
        Expected {expected_status_code}, recieved {status_code}
        Response body:''')
    response_body = json.dumps(response.json(), indent=4)
    logging.debug(f'{response_code_details}\n{response_body})')
    self.assertEqual(
        status_code,
        expected_status_code,
        f'requested_url: {requested_url},\nresponse_body: {response_body}'
    )

    # Response time should less then max_elapsed_seconds
    elapsed_seconds = response.elapsed.total_seconds()
    logging.debug(f'Request took {elapsed_seconds} second(s)')
    self.assertLess(elapsed_seconds, max_elapsed_seconds)

    return response


# Check the schema of response match OpenAPI specification
def check_schema(self, response, schema, nullable_fields):
    # Mapping of OpenAPI data types and python data types
    types_dict = {
        'string': str,
        'integer': int,
        'int32': int,
        'int64': int,
        'float': (float, int),
        'double': (float, int),
        'number': (float, int),
        'boolean': bool,
        'array': list,
        'object': dict
    }

    # Helper function to get attributes of the schema
    def __get_schema_attributes():
        return schema['attributes']['properties']

    # Helper function to map between OpenAPI data types and python data types
    def __get_attribute_type(attribute):
        if 'properties' in attribute:
            return dict
        elif 'format' in attribute and attribute['format'] in types_dict:
            openapi_type = attribute['format']
        elif 'type' in attribute:
            openapi_type = attribute['type']
        elif '$ref' in attribute:
            openapi_type = __get_reference_type(attribute['$ref'])

        if not openapi_type:
            logging.warning('OpenAPI property contains no type or properties')
            return None
        else:
            return types_dict[openapi_type]

    # Helper function to get type of referenced object
    def __get_reference_type(object_path, root_object_paths=None):
        keys = re.split('/', re.search('#/(.*)', object_path).group(1))
        reference = self.openapi
        for key in keys:
            reference = reference[key]

        if 'format' in reference and reference['format'] in types_dict:
            return reference['format']
        elif 'type' in reference:
            return reference['type']
        elif '$ref' in reference:
            nested_reference = reference['$ref']
            # Avoid infinite recursion
            if not root_object_paths:
                root_object_paths = [object_path]
            if nested_reference not in root_object_paths:
                root_object_paths.append(nested_reference)
                return __get_reference_type(nested_reference,
                                            root_object_paths)

        return None

    # Helper function to check resource object schema
    def __check_resource_schema(resource):
        # Check resource type
        self.assertEqual(resource['type'], schema['type']['enum'][0])
        # Check resource attributes
        actual_attributes = resource['attributes']
        expected_attributes = __get_schema_attributes()
        __check_attributes_schema(actual_attributes, expected_attributes)

    # Helper function to check error object schema
    def __check_error_schema(error):
        # Check error attributes
        actual_attributes = error
        expected_attributes = schema
        __check_attributes_schema(actual_attributes, expected_attributes)

    # Helper function to check through all attributes
    def __check_attributes_schema(actual_attributes, expected_attributes):
        for field, actual_value in actual_attributes.items():
            self.assertIn(
                field,
                expected_attributes.keys(),
                f"Unexpected field '{field}'"
            )
            expected_attribute = expected_attributes[field]
            expected_type = __get_attribute_type(expected_attribute)

            # Check item schema if attribute is an array
            if (
                expected_type is list
                and 'properties' in expected_attributes[field]['items']
            ):
                expected_item = (
                    expected_attributes[field]['items']['properties']
                )
                actual_items = actual_attributes[field]

                for actual_item in actual_items:
                    __check_attributes_schema(actual_item, expected_item)

            if (
                (actual_value and expected_type)
                or field not in nullable_fields
            ):
                self.assertIsInstance(actual_value, expected_type)

    status_code = response.status_code
    content = get_json_content(self, response)

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


# Check url for correct base and endpoint, parameters
def check_url(self, link_url, endpoint, query_params=None):
    query_params = {} if query_params is None else query_params

    base_url = self.base_url
    if self.local_test:
        """Local instances return self links without port and /api"""
        base_url = re.sub(r':\d{4}/api', '', self.base_url)

    link_url_obj = urllib.parse.urlparse(link_url)
    base_url_obj = urllib.parse.urlparse(base_url)

    url_equalities = [
      [link_url_obj.scheme, base_url_obj.scheme, 'scheme'],
      [link_url_obj.netloc, base_url_obj.netloc, 'netloc'],
      [link_url_obj.path, f'{base_url_obj.path}{endpoint}', 'path']]

    for link_attribute, base_attribute, attribute_type in url_equalities:
        self.assertEqual(link_attribute, base_attribute,
                         textwrap.dedent(f'''
                            {attribute_type} does not match
                            Expected: {base_attribute}
                            Link: {link_attribute}'''))

    link_url_query = dict(urllib.parse.parse_qsl(
        link_url_obj.query,
        keep_blank_values=True
    ))
    self.assertTrue(set(link_url_query).issuperset(set(query_params)),
                    textwrap.dedent(f'''
                        Query parameter(s) not in link.
                        Requested parameters: {query_params}
                        Link parameters: {link_url_query}'''))


# Check response of an endpoint for response code, schema, self link
def test_endpoint(self, endpoint, resource, response_code, query_params=None,
                  nullable_fields=None):
    nullable_fields = [] if nullable_fields is None else nullable_fields
    schema = get_resource_schema(self, resource)
    response = make_request(self, endpoint, response_code,
                            params=query_params)

    check_schema(self, response, schema, nullable_fields)
    response_json = response.json()
    if 'links' in response_json:
        check_url(self, response_json['links']['self'], endpoint, query_params)
    return response


class assertion_tests(unittest.TestCase):
    # Helper function to check if a response value starts with the test value
    def actual_starts_with_test(self, actual_case, test_case):
        self.assertTrue(actual_case.lower().startswith(test_case.lower()))

    # Helper function to check if a response value is literally equal
    # to the actual value
    def actual_equals_test_str(self, actual_case, test_case):
        self.assertTrue(str(actual_case), str(test_case))

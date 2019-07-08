import json
import logging
import unittest
import yaml

from prance import ResolvingParser

import utils


class integration_tests(unittest.TestCase):
    @classmethod
    def setup(cls, config_path, openapi_path):
        with open(config_path) as config_file:
            config = json.load(config_file)
            cls.base_url = utils.setup_base_url(config)
            cls.session = utils.setup_session(config)
            cls.test_cases = config['test_cases']
            cls.local_test = config['local_test']

        with open(openapi_path) as openapi_file:
            openapi = yaml.load(openapi_file, Loader=yaml.SafeLoader)
            if 'swagger' in openapi:
                backend = 'flex'
            elif 'openapi' in openapi:
                backend = 'openapi-spec-validator'
            else:
                exit('Error: could not determine openapi document version')

        parser = ResolvingParser(openapi_path, backend=backend)
        cls.openapi = parser.specification

    @classmethod
    def cleanup(cls):
        cls.session.close()

    # Test case: GET /pets
    def test_get_all_pets(self, endpoint='/pets'):
        nullable_fields = ['owner']
        utils.test_endpoint(self, endpoint, 'PetResource', 200,
                            nullable_fields=nullable_fields)

    # Test case: GET /pets with species filter
    def test_get_pets_with_filter(self, endpoint='/pets'):
        testing_species = ['dog', 'CAT', 'tUrTlE']

        for species in testing_species:
            params = {'species': species}
            response = utils.test_endpoint(self, endpoint, 'PetResource', 200,
                                           query_params=params)

            response_data = response.json()['data']
            for resource in response_data:
                actual_species = resource['attributes']['species']
                self.assertEqual(actual_species.lower(), species.lower())

    # Test case: GET /pets with pagination parameters
    def test_get_pets_pagination(self, endpoint='/pets'):
        testing_paginations = [
            {'number': 1, 'size': 25, 'expected_status_code': 200},
            {'number': 1, 'size': None, 'expected_status_code': 200},
            {'number': None, 'size': 25, 'expected_status_code': 200},
            {'number': 999, 'size': 1, 'expected_status_code': 200},
            {'number': -1, 'size': 25, 'expected_status_code': 400},
            {'number': 1, 'size': -1, 'expected_status_code': 400},
            {'number': 1, 'size': 501, 'expected_status_code': 400}
        ]
        nullable_fields = ['owner']
        for pagination in testing_paginations:
            params = {f'page[{k}]': pagination[k] for k in ['number', 'size']}
            expected_status_code = pagination['expected_status_code']
            resource = (
                'PetResource' if expected_status_code == 200
                else 'ErrorObject'
            )
            response = utils.test_endpoint(self, endpoint, resource,
                                           expected_status_code,
                                           query_params=params,
                                           nullable_fields=nullable_fields)
            content = utils.get_json_content(self, response)
            if expected_status_code == 200:
                try:
                    meta = content['meta']
                    num = pagination['number'] if pagination['number'] else 1
                    size = pagination['size'] if pagination['size'] else 25

                    self.assertEqual(num, meta['currentPageNumber'])
                    self.assertEqual(size, meta['currentPageSize'])
                except KeyError as error:
                    self.fail(error)

    # Test case: GET /pets/{id}
    def test_get_pet_by_id(self, endpoint='/pets'):
        valid_pet_ids = self.test_cases['valid_pet_ids']
        invalid_pet_ids = self.test_cases['invalid_pet_ids']

        for pet_id in valid_pet_ids:
            resource = 'PetResource'
            utils.test_endpoint(self, f'{endpoint}/{pet_id}', resource, 200)

        for pet_id in invalid_pet_ids:
            resource = 'ErrorObject'
            utils.test_endpoint(self, f'{endpoint}/{pet_id}', resource, 404)


if __name__ == '__main__':
    arguments, argv = utils.parse_arguments()

    # Setup logging level
    if arguments.debug:
        logging.basicConfig(level=logging.DEBUG)
    else:
        logging.basicConfig(level=logging.INFO)

    integration_tests.setup(arguments.config_path, arguments.openapi_path)
    unittest.main(argv=argv)
    integration_tests.cleanup()

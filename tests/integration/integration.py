import logging
import json
import unittest
import yaml
import utils


class integration_tests(unittest.TestCase):
    @classmethod
    def setup(cls, config_path, openapi_path):
        with open(config_path) as config_file:
            config = json.load(config_file)
            cls.base_url = utils.setup_base_url(config)
            cls.session = utils.setup_session(config)

        with open(openapi_path) as openapi_file:
            cls.openapi = yaml.load(openapi_file)

    @classmethod
    def cleanup(cls):
        cls.session.close()

    def test_get_pets(self, endpoint='/pets'):
        response = utils.make_request(self, endpoint, 200)
        pet_schema = utils.get_resource_schema(self, 'PetResource')
        utils.check_schema(self, response, pet_schema)

    def test_get_pet_by_id(self, endpoint='/pets/1'):
        response = utils.make_request(self, endpoint, 200)
        pet_schema = utils.get_resource_schema(self, 'PetResource')
        utils.check_schema(self, response, pet_schema)

    def test_get_not_found_by_id(self, endpoint='/pets/123'):
        response = utils.make_request(self, endpoint, 404)
        error_schema = utils.get_resource_schema(self, 'Error')
        utils.check_schema(self, response, error_schema)


if __name__ == '__main__':
    arguments, argv = utils.parse_arguments()

    if arguments.debug:
        logging.basicConfig(level=logging.DEBUG)
    else:
        logging.basicConfig(level=logging.INFO)

    integration_tests.setup(arguments.config_path, arguments.openapi_path)
    unittest.main(argv=argv, exit=False)
    integration_tests.cleanup()

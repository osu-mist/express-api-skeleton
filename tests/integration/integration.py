import logging
import json
import unittest
import yaml
import utils


class integration_tests(unittest.TestCase):
    # Setup class variables
    @classmethod
    def setup(cls, config_path, openapi_path):
        with open(config_path) as config_file:
            config = json.load(config_file)
            cls.base_url = utils.setup_base_url(config)
            cls.session = utils.setup_session(config)
        with open(openapi_path) as openapi_file:
            cls.openapi = yaml.load(openapi_file)

    def test_pets(self):
        print(utils.make_request(self, '/pets').json())
        assert 1 == 1


if __name__ == '__main__':
    arguments, argv = utils.parse_arguments()

    if arguments.debug:
        logging.basicConfig(level=logging.DEBUG)
    else:
        logging.basicConfig(level=logging.INFO)

    integration_tests.setup(arguments.config_path, arguments.openapi_path)
    unittest.main(argv=argv)

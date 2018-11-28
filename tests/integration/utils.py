import argparse
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


def make_request(instance, endpoint, params=None):
    requested_url = f'{instance.base_url}{endpoint}'
    return instance.session.get(requested_url, params=params)

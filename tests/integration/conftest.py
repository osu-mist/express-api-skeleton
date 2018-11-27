import json
import pytest
import requests
import sys
import urllib3


@pytest.fixture(scope='session')
def config():
    with open('configuration.json', 'r') as config_file:
        config = json.load(config_file)
    return config


@pytest.fixture(scope='session')
def base_url(config):
    api = config['api']
    return api['local_base_url'] if config['local_test'] else api['base_url']


@pytest.fixture(scope='session')
def session(config):
    session = requests.Session()

    if config['local_test']:
        basic_auth = config['auth']['basic_auth']
        session.auth = (basic_auth['username'], basic_auth['password'])
        session.verify = False
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
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

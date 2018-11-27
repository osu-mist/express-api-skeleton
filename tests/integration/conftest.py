import json
import pytest
import requests
import sys


@pytest.fixture(scope='session')
def load_config():
    with open('configuration.json', 'r') as config_file:
        config = json.load(config_file)
    return config


@pytest.fixture(scope='session')
def setup_session(config):
    session = requests.Session()

    if config['local_testing']:
        basic_auth = config['api']['basic_auth']
        session.auth = (basic_auth['username'], basic_auth['password'])
        session.verify = False
    else:
        oauth2 = config['api']['oauth2']
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

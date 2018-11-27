import logging
import pytest

from helpers import assert_response_time


class TestPets(object):
    @pytest.mark.parametrize('endpoint', ['/pets'])
    def test_get_successful_response(self, session, base_url, endpoint):
        response = session.get(f'{base_url}{endpoint}')

        logging.info('should respond 200')
        assert response.status_code == 200

        max_elapsed_seconds = 3
        logging.info(f'should respond in {max_elapsed_seconds} seconds')
        assert_response_time(response, max_elapsed_seconds)

    @pytest.mark.parametrize('endpoint', ['/pets/1', '/pets/2'])
    def test_get_by_id_successful_response(self, session, base_url, endpoint):
        response = session.get(f'{base_url}{endpoint}')

        logging.info('should response 200')
        assert response.status_code == 200

        max_elapsed_seconds = 2
        logging.info(f'should respond in {max_elapsed_seconds} seconds')
        assert_response_time(response, max_elapsed_seconds)

import pytest


@pytest.mark.parametrize('endpoint', ['/pets'])
class TestPets(object):
    def test_get_successful_response(self, session, base_url, endpoint):
        res = session.get(f'{base_url}{endpoint}')
        assert res.status_code == 200

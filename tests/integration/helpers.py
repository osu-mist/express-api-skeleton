import logging


def assert_response_time(response, max_elapsed_seconds):
    elapsed_seconds = response.elapsed.total_seconds()
    logging.debug(f'Request took {elapsed_seconds} second(s).')
    assert elapsed_seconds <= max_elapsed_seconds

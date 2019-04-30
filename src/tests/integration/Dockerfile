FROM python:3.7

WORKDIR /usr/src/app

COPY tests/integration .
COPY openapi.yaml .

RUN pip install --no-cache-dir -r requirements.txt

RUN /bin/bash -c \
    'OUTPUT=$(head -n 1 openapi.yaml); \
    if [[ $OUTPUT == *"swagger"* ]]; then \
        pip install --no-cache flex; \
    else \
        pip install --no-cache openapi-spec-validator; \
    fi'

USER nobody:nogroup

CMD ["python", "integration-test.py", "--config=configuration.json", "--openapi=openapi.yaml", "-v"]

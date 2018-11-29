FROM python:3.7

WORKDIR /usr/src/app

COPY tests/integration .
COPY openapi.yaml .

RUN pip install --no-cache-dir -r requirements.txt

USER nobody:nogroup

CMD ["python", "integration-test.py", "--config=configuration.json", "--openapi=openapi.yaml", "-v"]

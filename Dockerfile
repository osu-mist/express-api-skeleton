FROM node:8.11

# Copy folder to workspace
WORKDIR /usr/src/express-api-skeleton
COPY . /usr/src/express-api-skeleton

# Install dependent packages via yarn
RUN yarn

# Run unit tests
RUN ./node_modules/.bin/gulp test
USER nobody:nogroup

# Run application
ENTRYPOINT ["./node_modules/.bin/gulp", "run"]

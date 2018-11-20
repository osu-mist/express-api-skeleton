const appRoot = require('app-root-path');
const fs = require('fs');
const yaml = require('js-yaml');

const openapi = yaml.safeLoad(fs.readFileSync(`${appRoot}/openapi.yaml`, 'utf8'));

module.exports = { openapi };

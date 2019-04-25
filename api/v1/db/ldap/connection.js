const config = require('config');
const ldap = require('ldapjs');

const ldapConfig = config.get('dataSources').ldap;

/**
 * @summary Get an ldap connection
 * @function
 * @returns ldapjs client connection object
 */
const getClient = () => {
  ldap.createClient({
    url: ldapConfig.url,
  });
};

/**
 * @summary Validate ldap connection and throw an error if invalid
 * @function
 * @throws Throws an error if unable to connect or search ldap
 */
const validateLdap = async () => {
  try {
    const client = getClient();

    // Perform some search that returns less than 200 results
    client.search('o=orst.edu', { filter: 'osuPrimaryAffiliation=Retiree', scope: 'sub' });
  } catch (err) {
    throw new Error('Error connecting to ldap');
  }
};

module.exports = { getClient, validateLdap };

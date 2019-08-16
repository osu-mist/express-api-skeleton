const AWS = require('aws-sdk');
const config = require('config');
const _ = require('lodash');

const awsConfig = config.get('dataSources.awsS3');

const s3 = new AWS.S3(awsConfig);
let thisBucket = null;

/**
 * Set the bucket to be used for subsequent function calls.
 *
 * @private
 * @param {string} bucket The bucket to be set
 */
const setBucket = (bucket) => {
  thisBucket = bucket;
};

/**
 * Executes closure. If closure rejects, alternative values are returned depending on the error code
 *
 * @private
 * @param {Function<Promise>} closure Closure to be executed. Should return a promise that only
 *                                    rejects with AWS S3 error objects
 * @param {object<string, *>} errorResponses Mapping of error codes to return values
 * @returns {Promise} The result of the closure or an alternative return value specified in
 *                    errorResponses
 */
const withErrorHandler = async (closure, errorResponses) => {
  try {
    return await closure();
  } catch (err) {
    if (_.keys(errorResponses).includes(err.code)) {
      return errorResponses[err.code];
    }
    throw err;
  }
};

/**
 * Checks if a bucket exists
 *
 * @param {string} bucket The bucket to be checked
 * @returns {Promise} Promise object represents a boolean indicating if the bucket exists or not
 */
const bucketExists = async (bucket = thisBucket) => {
  const params = { Bucket: bucket };
  return withErrorHandler(async () => {
    await s3.headBucket(params).promise();
    return true;
  }, { NotFound: false });
};

/** Verify the AWS S3 data source */
const validateAwsS3 = async () => {
  const { bucket } = config.get('dataSources.awsS3');
  if (!await bucketExists(bucket)) {
    throw new Error('AWS bucket does not exist');
  } else {
    setBucket(bucket);
  }
};

/**
 * Checks if an object exists in a bucket
 *
 * @param {string} key The key of the object to be checked
 * @param {string} bucket The bucket where the key will be searched
 * @returns {Promise} Promise object represents a boolean indicating if the key exists or not
 */
const objectExists = async (key, bucket = thisBucket) => {
  const params = { Bucket: bucket, Key: key };
  return withErrorHandler(async () => {
    await s3.headObject(params).promise();
    return true;
  }, { NotFound: false });
};

/**
 * Gets metadata on an object by making a head-object request
 *
 * @param {string} key Key of the object
 * @param {string} bucket Bucket where the object exists
 * @returns {Promise} Promise object representing the response
 */
const headObject = async (key, bucket = thisBucket) => {
  const params = { Bucket: bucket, Key: key };
  return s3.headObject(params).promise();
};

/**
 * List objects in a bucket
 *
 * @param {object} params Additional params to be used in the search
 * @param {string} bucket The bucket to search for objects
 * @returns {Promise} Promise object representing the objects
 */
const listObjects = async (params = {}, bucket = thisBucket) => {
  const newParams = { Bucket: bucket, ...params };
  return s3.listObjectsV2(newParams).promise();
};

/**
 * Gets an object from a bucket
 *
 * @param {string} key The key of the object
 * @param {string} bucket The bucket where the object exists
 * @returns {Promise} Promise object representing the object response. undefined if the object does
 * not exist
 */
const getObject = async (key, bucket = thisBucket) => {
  const params = { Bucket: bucket, Key: key };
  return withErrorHandler(s3.getObject(params).promise, { NoSuchKey: undefined });
};

/**
 * Uploads a new directory object to a bucket
 *
 * @param {string} key The key of the object. Must end with "/"
 * @param {object} params Additional params to be used when creating the directory
 * @param {string} bucket The bucket that the object will be uploaded to
 * @returns {Promise} Promise object representing the response
 */
const putDir = async (key, params = {}, bucket = thisBucket) => {
  if (_.last(key) !== '/') {
    throw new Error(`Directory key: "${key}" does not end with "/"`);
  }
  const newParams = {
    Key: key,
    Bucket: bucket,
    ContentType: 'application/x-directory',
    ...params,
  };
  return s3.putObject(newParams).promise();
};

/**
 * Uploads an object to a bucket as JSON
 *
 * @param {object} object The object to be uploaded
 * @param {string} key The desired key name of the object
 * @param {object} params Additional params to be used in put-object
 * @param {string} bucket The bucket to upload the object to
 * @returns {Promise} Promise object representing the response
 */
const putObject = async (object, key, params = {}, bucket = thisBucket) => {
  const newParams = {
    Body: JSON.stringify(object, null, 2),
    Key: key,
    Bucket: bucket,
    ContentType: 'application/json',
    ...params,
  };
  return s3.putObject(newParams).promise();
};

/**
 * Update an existing object's metadata by copying the object to itself
 *
 * @param {object} metadata The desired metadata that will be added to or replace existing metadata
 * @param {string} key The key of the object
 * @param {string} bucket The bucket where the object is located
 * @returns {Promise} Promise object representing the response
 */
const updateMetadata = async (metadata, key, bucket = thisBucket) => {
  const currentHead = await headObject(key, bucket);
  const newMetadata = { ...currentHead.Metadata, ...metadata };
  const params = {
    Bucket: bucket,
    Key: key,
    CopySource: `${bucket}/${key}`,
    ContentType: currentHead.ContentType,
    Metadata: newMetadata,
    MetadataDirective: 'REPLACE',
  };
  return s3.copyObject(params).promise();
};

/**
 * Delete an existing object
 *
 * @param {string} key The key of the object to be deleted
 * @param {string} bucket The bucket where the object is located
 * @returns {Promise} Promise object representing the response. undefined if the key was not found
 */
const deleteObject = async (key, bucket = thisBucket) => {
  const params = { Bucket: bucket, Key: key };
  return withErrorHandler(s3.deleteObject(params).promise, { NotFound: undefined });
};

module.exports = {
  bucketExists,
  validateAwsS3,
  objectExists,
  headObject,
  listObjects,
  getObject,
  putDir,
  putObject,
  updateMetadata,
  deleteObject,
};

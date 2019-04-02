const AWS = require('aws-sdk');
const config = require('config');
const _ = require('lodash');

const awsConfig = config.get('dataSources.awsS3');

const s3 = new AWS.S3(awsConfig);
let thisBucket = null;

/**
 * @summary Set the bucket to be used for subsequent function calls.
 * @function
 */
const setBucket = (bucket) => {
  thisBucket = bucket;
};

/**
 * @summary Checks if a bucket exists
 * @function
 * @param {string} bucket The bucket to be checked
 * @returns {Promise} Promise object represents a boolean indicating if the bucket exists or not
 */
const bucketExists = (bucket = thisBucket) => new Promise((resolve, reject) => {
  const params = { Bucket: bucket };
  s3.headBucket(params).promise().then(() => {
    resolve(true);
  }).catch((err) => {
    if (err.code === 'NotFound') {
      resolve(false);
    } else {
      reject(err);
    }
  });
});

/**
 * @summary Verify the AWS S3 data source
 * @function
 */
const validateAwsS3 = async () => {
  const { bucket } = config.get('dataSources.awsS3');
  if (!await bucketExists(bucket)) {
    throw new Error('Error: AWS bucket does not exist');
  } else {
    setBucket(bucket);
  }
};

/**
 * @summary Checks if an object exists in a bucket
 * @function
 * @param {string} key The key of the object to be checked
 * @param {string} bucket The bucket where the key will be searched
 * @returns {Promise} Promise object represents a boolean indicating if the key exists or not
 */
const objectExists = (key, bucket = thisBucket) => new Promise((resolve, reject) => {
  const params = { Bucket: bucket, Key: key };
  s3.headObject(params).promise().then(() => {
    resolve(true);
  }).catch((err) => {
    if (err.code === 'NotFound') {
      resolve(false);
    } else {
      reject(err);
    }
  });
});

/**
 * @summary Gets metadata on an object by making a head-object request
 * @function
 * @param {string} key Key of the object
 * @param {string} bucket Bucket where the object exists
 * @returns {Promise} Promise object representing the response
 */
const headObject = (key, bucket = thisBucket) => {
  const params = { Bucket: bucket, Key: key };
  return s3.headObject(params).promise();
};

/**
 * @summary List objects in a bucket
 * @function
 * @param {Object} params Additional params to be used in the search
 * @param {string} bucket The bucket to search for objects
 * @returns {Promise} Promise object representing the objects
 */
const listObjects = (params = {}, bucket = thisBucket) => {
  const newParams = Object.assign({ Bucket: bucket }, params);
  return s3.listObjectsV2(newParams).promise();
};

/**
 * @summary Gets an object from a bucket
 * @function
 * @param {string} key The key of the object
 * @param {string} bucket The bucket where the object exists
 * @returns {Promise} Promise object representing the object response. undefined if the object does
 * not exist
 */
const getObject = (key, bucket = thisBucket) => new Promise((resolve, reject) => {
  const params = { Bucket: bucket, Key: key };
  s3.getObject(params).promise().then((data) => {
    resolve(data);
  }).catch((err) => {
    if (err.code === 'NoSuchKey') {
      resolve(undefined);
    } else {
      reject(err);
    }
  });
});

/**
 * @summary Uploads a new directory object to a bucket
 * @function
 * @param {string} key The key of the object. Must end with "/"
 * @param {Object} params Additional params to be used when creating the directory
 * @param {string} bucket The bucket that the object will be uploaded to
 * @returns {Promise} Promise object representing the response
 */
const putDir = (key, params = {}, bucket = thisBucket) => {
  if (_.last(key) !== '/') {
    throw new Error(`Error: directory key: "${key}" does not end with "/"`);
  }
  const newParams = Object.assign(
    { Key: key, Bucket: bucket, ContentType: 'application/x-directory' },
    params,
  );
  return s3.putObject(newParams).promise();
};

/**
 * @summary Uploads an object to a bucket as JSON
 * @function
 * @param {Object} object The object to be uploaded
 * @param {string} key The desired key name of the object
 * @param {Object} params Additional params to be used in put-object
 * @param {string} bucket The bucket to upload the object to
 * @returns {Promise} Promise object representing the response
 */
const putObject = (object, key, params = {}, bucket = thisBucket) => {
  const newParams = Object.assign(
    {
      Body: JSON.stringify(object, null, 2),
      Key: key,
      Bucket: bucket,
      ContentType: 'application/json',
    },
    params,
  );
  return s3.putObject(newParams).promise();
};

/**
 * @summary Update an existing object's metadata by copying the object to itself
 * @function
 * @param {Object} metadata The desired metadata that will be added to or replace existing metadata
 * @param {string} key The key of the object
 * @param {string} bucket The bucket where the object is located
 * @returns {Promise} Promise object representing the response
 */
const updateMetadata = async (metadata, key, bucket = thisBucket) => {
  const currentHead = await headObject(key, bucket);
  const newMetadata = Object.assign(currentHead.Metadata, metadata);
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
 * @summary Delete an existing object
 * @function
 * @param {string} key The key of the object to be deleted
 * @param {string} bucket The bucket where the object is located
 * @returns {Promise} Promise object representing the response. undefined if the key was not found
 */
const deleteObject = (key, bucket = thisBucket) => new Promise((resolve, reject) => {
  const params = { Bucket: bucket, Key: key };
  s3.deleteObject(params).promise().then((data) => {
    resolve(data);
  }).catch((err) => {
    if (err.code === 'NotFound') {
      resolve(undefined);
    } else {
      reject(err);
    }
  });
});

module.exports = {
  setBucket,
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

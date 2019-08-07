const appRoot = require('app-root-path');
const AWS = require('aws-sdk');
const chai = require('chai');
const chaiExclude = require('chai-exclude');
const chaiAsPromised = require('chai-as-promised');
const config = require('config');
const _ = require('lodash');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

chai.should();
chai.use(chaiExclude);
chai.use(chaiAsPromised);

afterEach(() => {
  sinon.restore();
});

describe('Test aws-operations', () => {
  let configGetStub;
  let awsOperations;
  const testBucket = 'test-bucket';

  beforeEach(() => {
    configGetStub = sinon.stub(config, 'get')
      .withArgs('dataSources.awsS3')
      .returns({ bucket: testBucket });
  });

  const createS3Stub = (stubs) => {
    // aws-operations uses the .promise() method of s3 methods so this needs to be stubbed
    const stubReturn = _.mapValues(stubs, value => (
      () => ({ promise: value })
    ));
    const s3Stub = sinon.stub(AWS, 'S3').returns(stubReturn);
    awsOperations = proxyquire(`${appRoot}/api/v1/db/awsS3/aws-operations`, {
      config: { get: configGetStub },
      'aws-sdk': { S3: s3Stub },
    });
  };

  describe('bucketExists', () => {
    const testCases = [
      {
        description: 'Should resolve as true if headBucket().promise resolves',
        headBucketStub: sinon.stub().resolves({}),
        assertion: result => result.should.eventually.be.fulfilled.and.equal(true),
      },
      {
        description: 'Should resolve as false if headBucket().promise rejects with NotFound error code',
        headBucketStub: sinon.stub().rejects({ code: 'NotFound' }),
        assertion: result => result.should.eventually.be.fulfilled.and.equal(false),
      },
      {
        description: 'Should reject if headBucket().promise rejects with unexpected error code',
        headBucketStub: sinon.stub().rejects({ code: 'other' }),
        assertion: result => result.should.be.rejected,
      },
    ];

    _.forEach(testCases, ({ description, headBucketStub, assertion }) => {
      it(description, () => {
        createS3Stub({ headBucket: headBucketStub });
        const result = awsOperations.bucketExists();
        return assertion(result);
      });
    });
  });

  describe('validateAwsS3', () => {
    const testCases = [
      {
        description: 'Should resolve if headBucket().promise resolves',
        headBucketStub: sinon.stub().resolves({}),
        assertion: result => result.should.eventually.be.fulfilled,
      },
      {
        description: 'Should reject if headBucket().promise rejects',
        headBucketStub: sinon.stub().rejects({ code: 'NotFound' }),
        assertion: result => result.should.be.rejectedWith(Error, 'AWS bucket does not exist'),
      },
    ];

    _.forEach(testCases, ({ description, headBucketStub, assertion }) => {
      it(description, () => {
        createS3Stub({ headBucket: headBucketStub });
        const result = awsOperations.validateAwsS3();
        return assertion(result);
      });
    });
  });

  describe('objectExists', () => {
    const testCases = [
      {
        description: 'Should resolve as true if headObject().promise resolves',
        headObjectStub: sinon.stub().resolves({}),
        assertion: result => result.should.eventually.be.fulfilled.and.equal(true),
      },
      {
        description: 'Should resolve as false if headObject().promise rejects with NotFound error code',
        headObjectStub: sinon.stub().rejects({ code: 'NotFound' }),
        assertion: result => result.should.eventually.be.fulfilled.and.equal(false),
      },
      {
        description: 'Should reject if headObject().promise rejects with unexpected error code',
        headObjectStub: sinon.stub().rejects({ code: 'other' }),
        assertion: result => result.should.be.rejected,
      },
    ];

    _.forEach(testCases, ({ description, headObjectStub, assertion }) => {
      it(description, () => {
        createS3Stub({ headObject: headObjectStub });
        const result = awsOperations.objectExists('test-key');
        return assertion(result);
      });
    });
  });
});

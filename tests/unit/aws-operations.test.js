const appRoot = require('app-root-path');
const AWS = require('aws-sdk');
const chai = require('chai');
const chaiExclude = require('chai-exclude');
const chaiAsPromised = require('chai-as-promised');
const config = require('config');
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

  const createS3Stub = (method, stub) => {
    const s3Stub = sinon.stub(AWS, 'S3').returns({
      [method]: () => ({ promise: stub }),
    });
    awsOperations = proxyquire(`${appRoot}/api/v1/db/awsS3/aws-operations`, {
      config: { get: configGetStub },
      'aws-sdk': { S3: s3Stub },
    });
  };

  describe('bucketExists', () => {
    it('Should resolve as true if headBucket().promise resolves', () => {
      const headBucketPromiseStub = sinon.stub().resolves({});
      createS3Stub('headBucket', headBucketPromiseStub);
      const result = awsOperations.bucketExists();
      return result.should.eventually.be.fulfilled.and.equal(true);
    });

    it('Should resolve as false if headBucket().promise rejects with NotFound error code', () => {
      const headBucketPromiseStub = sinon.stub().rejects({ code: 'NotFound' });
      createS3Stub('headBucket', headBucketPromiseStub);
      const result = awsOperations.bucketExists();
      return result.should.eventually.be.fulfilled.and.equal(false);
    });

    it('Should reject if headBucket().promise rejects with unexpected error code', () => {
      const headBucketPromiseStub = sinon.stub().rejects({ code: 'other' });
      createS3Stub('headBucket', headBucketPromiseStub);
      const result = awsOperations.bucketExists();
      return result.should.be.rejected;
    });
  });

  describe('validateAwsS3', () => {
    it('Should set the bucket if headBucket().promise resolves', () => {
      const headBucketPromiseStub = sinon.stub().resolves({});
      createS3Stub('headBucket', headBucketPromiseStub);
      const result = awsOperations.validateAwsS3();
      return result.should.eventually.be.fulfilled;
    });

    it('Should reject if headBucket().promise rejects', () => {
      const headBucketPromiseStub = sinon.stub().rejects({ code: 'NotFound' });
      createS3Stub('headBucket', headBucketPromiseStub);
      const result = awsOperations.validateAwsS3();
      return result.should.rejectedWith(Error, 'AWS bucket does not exist');
    });
  });
});

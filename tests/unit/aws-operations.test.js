const appRoot = require('app-root-path');
const AWS = require('aws-sdk');
const chai = require('chai');
const chaiExclude = require('chai-exclude');
const chaiAsPromised = require('chai-as-promised');
const config = require('config');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(chaiExclude);
chai.use(chaiAsPromised);
chai.use(sinonChai);

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

  const getS3MethodStub = promiseStub => sinon.stub().returns(({ promise: promiseStub }));

  const createS3Stub = (stubs) => {
    const s3Stub = sinon.stub(AWS, 'S3').returns(stubs);
    awsOperations = proxyquire(`${appRoot}/api/v1/db/awsS3/aws-operations`, {
      config: { get: configGetStub },
      'aws-sdk': { S3: s3Stub },
    });
  };

  describe('bucketExists', () => {
    it('Should resolve as true if headBucket promise resolves', async () => {
      const promiseStub = sinon.stub().resolves({});
      const headBucketStub = getS3MethodStub(promiseStub);
      createS3Stub({ headBucket: headBucketStub });
      const result = awsOperations.bucketExists();
      await result.should.eventually.be.fulfilled.and.equal(true);
      headBucketStub.should.have.been.calledOnce;
      promiseStub.should.have.been.calledOnce;
    });

    it('Should resolve as false if headBucket promise rejects with NotFound error', async () => {
      const promiseStub = sinon.stub().rejects({ code: 'NotFound' });
      const headBucketStub = getS3MethodStub(promiseStub);
      createS3Stub({ headBucket: headBucketStub });
      const result = awsOperations.bucketExists();
      await result.should.eventually.be.fulfilled.and.equal(false);
      headBucketStub.should.have.been.calledOnce;
      promiseStub.should.have.been.calledOnce;
    });

    it('Should resolve as false if headBucket promise rejects with unexpected error', async () => {
      const promiseStub = sinon.stub().rejects({ code: 'other' });
      const headBucketStub = getS3MethodStub(promiseStub);
      createS3Stub({ headBucket: headBucketStub });
      const result = awsOperations.bucketExists();
      await result.should.eventually.be.rejected;
      headBucketStub.should.have.been.calledOnce;
      promiseStub.should.have.been.calledOnce;
    });
  });


  describe('validateAwsS3', () => {
    it('Should resolve if headBucket promise resolves', async () => {
      const promiseStub = sinon.stub().resolves({});
      const headBucketStub = getS3MethodStub(promiseStub);
      createS3Stub({ headBucket: headBucketStub });
      const result = awsOperations.validateAwsS3();
      await result.should.eventually.be.fulfilled;
      headBucketStub.should.have.been.calledOnce;
      promiseStub.should.have.been.calledOnce;
    });

    it('Should reject if headBucket promise rejects', async () => {
      const promiseStub = sinon.stub().rejects({ code: 'NotFound' });
      const headBucketStub = getS3MethodStub(promiseStub);
      createS3Stub({ headBucket: headBucketStub });
      const result = awsOperations.validateAwsS3();
      await result.should.eventually.be.rejectedWith(Error, 'AWS bucket does not exist');
      headBucketStub.should.have.been.calledOnce;
      promiseStub.should.have.been.calledOnce;
    });
  });

  describe('objectExists', () => {
    it('Should resolve as true if headObject promise resolves', async () => {
      const promiseStub = sinon.stub().resolves({});
      const headObjectStub = getS3MethodStub(promiseStub);
      createS3Stub({ headObject: headObjectStub });
      const result = awsOperations.objectExists('test-key');
      await result.should.eventually.be.fulfilled.and.equal(true);
      headObjectStub.should.have.been.calledOnce;
      promiseStub.should.have.been.calledOnce;
    });

    it('Should resolve as false if headObject promise rejects with NotFound error', async () => {
      const promiseStub = sinon.stub().rejects({ code: 'NotFound' });
      const headObjectStub = getS3MethodStub(promiseStub);
      createS3Stub({ headObject: headObjectStub });
      const result = awsOperations.objectExists('test-key');
      await result.should.eventually.be.fulfilled.and.equal(false);
      headObjectStub.should.have.been.calledOnce;
      promiseStub.should.have.been.calledOnce;
    });

    it('Should reject if headObject promise rejects with unexpected error code', async () => {
      const promiseStub = sinon.stub().rejects({ code: 'other' });
      const headObjectStub = getS3MethodStub(promiseStub);
      createS3Stub({ headObject: headObjectStub });
      const result = awsOperations.objectExists('test-key');
      await result.should.eventually.be.rejected;
      headObjectStub.should.have.been.calledOnce;
      promiseStub.should.have.been.calledOnce;
    });
  });

  describe('headObject', () => {
    it('Should resolve when headObject promise resolves', async () => {
      const promiseStub = sinon.stub().resolves({});
      const headObjectStub = getS3MethodStub(promiseStub);
      createS3Stub({ headObject: headObjectStub });
      const result = awsOperations.headObject('test-key');
      await result.should.eventually.be.fulfilled.and.deep.equal({});
      headObjectStub.should.have.been.calledOnce;
      promiseStub.should.have.been.calledOnce;
    });

    it('Should reject when headObject promise rejects', async () => {
      const promiseStub = sinon.stub().rejects({});
      const headObjectStub = getS3MethodStub(promiseStub);
      createS3Stub({ headObject: headObjectStub });
      const result = awsOperations.headObject('test-key');
      await result.should.be.rejectedWith({});
      headObjectStub.should.have.been.calledOnce;
      promiseStub.should.have.been.calledOnce;
    });
  });

  describe('listObjects', () => {
    it('Should resolve when listObjectsV2 promise resolves', async () => {
      const testParams = { paramKey: 'paramValue' };
      const testResult = { resultKey: 'resultValue' };
      const promiseStub = sinon.stub().resolves(testResult);
      const listObjectsV2Stub = getS3MethodStub(promiseStub);
      createS3Stub({ listObjectsV2: listObjectsV2Stub });
      const result = awsOperations.listObjects(testParams);
      await result.should.eventually.be.fulfilled.and.deep.equal(testResult);
      listObjectsV2Stub.should.have.been.calledOnce;
      listObjectsV2Stub.should.have.been.calledWithMatch(testParams);
      promiseStub.should.have.been.calledOnce;
    });

    it('Should reject when listObjectsV2 promise rejects', async () => {
      const testParams = { paramKey: 'paramValue' };
      const promiseStub = sinon.stub().rejects();
      const listObjectsV2Stub = getS3MethodStub(promiseStub);
      createS3Stub({ listObjectsV2: listObjectsV2Stub });
      const result = awsOperations.listObjects(testParams);
      await result.should.eventually.be.rejected;
      listObjectsV2Stub.should.have.been.calledOnce;
      listObjectsV2Stub.should.have.been.calledWithMatch(testParams);
      promiseStub.should.have.been.calledOnce;
    });
  });

  describe('getObject', () => {
    it('Should resolve when getObject promise resolves', async () => {
      const testKey = 'test-key';
      const testResult = { resultKey: 'resultValue' };
      const promiseStub = sinon.stub().resolves(testResult);
      const getObjectStub = getS3MethodStub(promiseStub);
      createS3Stub({ getObject: getObjectStub });
      const result = awsOperations.getObject(testKey);
      await result.should.eventually.be.fulfilled.and.deep.equal(testResult);
      getObjectStub.should.have.been.calledOnce;
      getObjectStub.should.have.been.calledWithMatch({ Key: testKey });
      promiseStub.should.have.been.calledOnce;
    });

    it('Should resolve undefined when getObject promise rejects with NoSuchKey error', async () => {
      const promiseStub = sinon.stub().rejects({ code: 'NoSuchKey' });
      const getObjectStub = getS3MethodStub(promiseStub);
      createS3Stub({ getObject: getObjectStub });
      const result = awsOperations.getObject('test-key');
      result.should.eventually.be.fulfilled.and.equal(undefined);
    });
  });
});

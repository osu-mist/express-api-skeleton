import AWS from 'aws-sdk';
import chai from 'chai';
import chaiExclude from 'chai-exclude';
import chaiAsPromised from 'chai-as-promised';
import config from 'config';
import proxyquireModule from 'proxyquire';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

const proxyquire = proxyquireModule.noCallThru();

chai.should();
chai.use(chaiExclude);
chai.use(chaiAsPromised);
chai.use(sinonChai);

const { assert } = chai;


describe('Test aws-operations', () => {
  let configGetStub;
  let awsOperations;
  const testBucket = 'test-bucket';

  beforeEach(() => {
    configGetStub = sinon.stub(config, 'get')
      .withArgs('dataSources.awsS3')
      .returns({ bucket: testBucket });
  });
  afterEach(() => sinon.restore());

  /**
   * Get an S3 method stub from a promise stub
   *
   * @param {object} promiseStub The promise stub
   * @returns {object} S3 method stub
   */
  const getS3MethodStub = (promiseStub) => sinon.stub().returns(({ promise: promiseStub }));

  /**
   * Create an S3 constructor stub and proxyquire awsOperations
   *
   * @param {object} stubs Mapping of S3 method names to stubs
   */
  const createS3Stub = (stubs) => {
    const s3Stub = sinon.stub(AWS, 'S3').returns(stubs);
    awsOperations = proxyquire('api/v1/db/awsS3/aws-operations', {
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
      await result.should.be.rejected;
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
      await result.should.be.rejectedWith(Error, 'AWS bucket does not exist');
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
      await result.should.be.rejected;
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
      await result.should.be.rejected;
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

  describe('putDir', () => {
    it('Should resolve when putObject promise resolves', async () => {
      const testKey = 'dir/';
      const testResult = { resultKey: 'resultValue' };
      const promiseStub = sinon.stub().resolves(testResult);
      const putObjectStub = getS3MethodStub(promiseStub);
      createS3Stub({ putObject: putObjectStub });
      const result = awsOperations.putDir(testKey);
      await result.should.eventually.be.fulfilled.and.deep.equal(testResult);
      putObjectStub.should.have.been.calledOnce;
      putObjectStub.should.have.been.calledWithMatch({ Key: testKey });
      promiseStub.should.have.been.calledOnce;
    });

    it('Should reject when key does not end with "/"', async () => {
      const testKey = 'dir';
      createS3Stub();
      const result = awsOperations.putDir(testKey);
      result.should.be.rejectedWith(`Directory key: "${testKey}" does not end with "/"`);
    });

    it('Should reject when putObject promise rejects', async () => {
      const testKey = 'dir/';
      const promiseStub = sinon.stub().rejects();
      const putObjectStub = getS3MethodStub(promiseStub);
      createS3Stub({ putObject: putObjectStub });
      const result = awsOperations.putDir(testKey);
      result.should.be.rejected;
    });
  });

  describe('putObject', () => {
    it('Should resolve when putObject promise resolves', async () => {
      const testObject = { testObjectKey: 'testObjectValue' };
      const testKey = 'test-key';
      const testResult = { testReturnKey: 'testReturnValue' };
      const promiseStub = sinon.stub().resolves(testResult);
      const putObjectStub = getS3MethodStub(promiseStub);
      createS3Stub({ putObject: putObjectStub });
      const result = awsOperations.putObject(testObject, testKey);
      await result.should.eventually.be.fulfilled.and.deep.equal(testResult);
      putObjectStub.should.have.been.calledOnce;
      assert.isNotEmpty(putObjectStub.args[0]);
      assert.containsAllKeys(putObjectStub.args[0][0], ['Body']);
      // compare 'Body' without regard for whitespace
      putObjectStub.args[0][0].Body = putObjectStub.args[0][0].Body.replace(/\s/g, '');
      putObjectStub.should.have.been.calledWithMatch({
        Key: testKey,
        Body: JSON.stringify(testObject),
      });
    });

    it('Should reject when putObject promise rejects', async () => {
      const promiseStub = sinon.stub().rejects();
      const putObjectStub = getS3MethodStub(promiseStub);
      createS3Stub({ putObject: putObjectStub });
      const result = awsOperations.putObject({}, 'test-key');
      result.should.be.rejected;
    });
  });

  describe('updateMetadata', () => {
    it('Should resolve when headObject promise and copyObject promise resolve', async () => {
      const originalMetadata = { originalMetaKey: 'originalMetaValue' };
      const newMetadata = { testMetaKey: 'testMetaValue', originalMetaKey: 'newMetaValue' };
      const testKey = 'test-key';
      const testResult = { resultKey: 'resultValue' };
      const originalHead = { Metadata: originalMetadata, ContentType: 'application/json' };
      const headObjectPromiseStub = sinon.stub().resolves(originalHead);
      const headObjectStub = getS3MethodStub(headObjectPromiseStub);
      const copyObjectPromiseStub = sinon.stub().resolves(testResult);
      const copyObjectStub = getS3MethodStub(copyObjectPromiseStub);
      createS3Stub({ headObject: headObjectStub, copyObject: copyObjectStub });
      const result = awsOperations.updateMetadata(newMetadata, testKey);

      await result.should.eventually.be.fulfilled.and.deep.equal(testResult);
      headObjectStub.should.have.been.calledOnce;
      headObjectStub.should.have.been.calledWithMatch({ Key: testKey });
      headObjectPromiseStub.should.have.been.calledOnce;
      copyObjectStub.should.have.been.calledOnce;
      copyObjectStub.should.have.been.calledWithMatch({
        Key: testKey,
        ContentType: originalHead.ContentType,
        Metadata: { ...originalMetadata, ...newMetadata },
        MetadataDirective: 'REPLACE',
      });
      copyObjectPromiseStub.should.have.been.calledOnce;
    });

    it('Should reject when headObject promise rejects', async () => {
      const headObjectPromiseStub = sinon.stub().rejects();
      const headObjectStub = getS3MethodStub(headObjectPromiseStub);
      const copyObjectPromiseStub = sinon.stub().resolves();
      const copyObjectStub = getS3MethodStub(copyObjectPromiseStub);
      createS3Stub({ headObject: headObjectStub, copyObject: copyObjectStub });
      const result = awsOperations.updateMetadata({}, 'test-key');
      result.should.be.rejected;
    });

    it('Should reject when copyObject promise rejects', async () => {
      const headObjectPromiseStub = sinon.stub().resolves();
      const headObjectStub = getS3MethodStub(headObjectPromiseStub);
      const copyObjectPromiseStub = sinon.stub().rejects();
      const copyObjectStub = getS3MethodStub(copyObjectPromiseStub);
      createS3Stub({ headObject: headObjectStub, copyObject: copyObjectStub });
      const result = awsOperations.updateMetadata({}, 'test-key');
      result.should.be.rejected;
    });
  });

  describe('deleteObject', () => {
    it('Should resolve when deleteObject promise resolves', async () => {
      const testKey = 'test-key';
      const testResult = { testResultKey: 'testResultValue' };
      const promiseStub = sinon.stub().resolves(testResult);
      const deleteObjectStub = getS3MethodStub(promiseStub);
      createS3Stub({ deleteObject: deleteObjectStub });
      const result = awsOperations.deleteObject(testKey);
      await result.should.eventually.be.fulfilled.and.deep.equal(testResult);
      deleteObjectStub.should.have.been.calledOnce;
      deleteObjectStub.should.have.been.calledWithMatch({ Key: testKey });
      promiseStub.should.have.been.calledOnce;
    });

    it('Should resolve as undefined when deleteObject promise rejects with NotFound', async () => {
      const promiseStub = sinon.stub().rejects({ code: 'NotFound' });
      const deleteObjectStub = getS3MethodStub(promiseStub);
      createS3Stub({ deleteObject: deleteObjectStub });
      const result = awsOperations.deleteObject('test-key');
      result.should.eventually.be.fulfilled.and.equal(undefined);
    });

    it('Should reject when deleteObject promise rejects with other error', async () => {
      const promiseStub = sinon.stub().rejects({ code: 'other' });
      const deleteObjectStub = getS3MethodStub(promiseStub);
      createS3Stub({ deleteObject: deleteObjectStub });
      const result = awsOperations.deleteObject('test-key');
      result.should.be.rejected;
    });
  });
});

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import config from 'config';
import _ from 'lodash';
import proxyquireModule from 'proxyquire';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

// Prevent call thru to original dependencies
const proxyquire = proxyquireModule.noCallThru();

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

afterEach(() => { sinon.restore(); });

describe('Test oracledb connection module', () => {
  let configGetStub;
  let connection;

  beforeEach(() => {
    configGetStub = sinon.stub(config, 'get')
      .withArgs('dataSources.oracledb')
      .returns({});
  });

  const createOracleDbStub = (createPoolStub) => {
    connection = proxyquire('api/v1/db/oracledb/connection', {
      config: { get: configGetStub },
      oracledb: { createPool: createPoolStub },
      // suppress logger output for testing
      '../../../../utils/logger': { logger: { error: () => {} } },
    });
  };

  describe('getConnection', () => {
    it('Should call createPool if pool is falsy. Should not call createPool additional times', async () => {
      const createPoolStub = sinon.stub()
        .resolves({ getConnection: async () => 'test-connection' });
      createOracleDbStub(createPoolStub);
      const firstResult = connection.getConnection();
      await firstResult.should.eventually.be.fulfilled.and.deep.equal('test-connection');
      const secondResult = connection.getConnection();
      await secondResult.should.eventually.be.fulfilled.and.deep.equal('test-connection');
      createPoolStub.should.have.been.calledOnce.and.always.calledWithMatch({});
      createPoolStub.should.have.been.calledWithMatch({});
    });
  });

  const testCases = [
    {
      description: 'Should resolve when connection.execute resolves',
      executeStub: () => sinon.stub().resolves(),
      promiseResult: (result) => result.should.eventually.be.fulfilled,
    },
    {
      description: 'Should reject when connection.execute rejects',
      executeStub: () => sinon.stub().rejects(),
      promiseResult: (result) => result.should.be.rejected,
    },
  ];

  describe('validateOracleDb', () => {
    _.forEach(testCases, (testCase) => {
      it(testCase.description, async () => {
        const executeStub = testCase.executeStub();
        const closeStub = sinon.stub().resolves();
        const createPoolStub = sinon.stub()
          .resolves({ getConnection: async () => ({ execute: executeStub, close: closeStub }) });
        createOracleDbStub(createPoolStub);
        const result = connection.validateOracleDb();
        await testCase.promiseResult(result);
        createPoolStub.should.have.been.calledOnce;
        executeStub.should.have.been.calledOnce;
        closeStub.should.have.been.calledOnce;
      });
    });
  });
});

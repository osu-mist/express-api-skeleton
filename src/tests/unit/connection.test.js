import chai from 'chai';
import chaiExclude from 'chai-exclude';
import chaiAsPromised from 'chai-as-promised';
import config from 'config';
import proxyquire from 'proxyquire';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.should();
chai.use(chaiExclude);
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

  const createOracleDbStub = (stubs) => {
    connection = proxyquire('api/v1/db/oracledb/connection', {
      config: { get: configGetStub },
      oracledb: stubs,
    });
  };

  describe('getConnection', () => {
    it('Should call createPool if pool is falsy. Should not call createPool additional times', async () => {
      const createPoolStub = sinon.stub()
        .resolves({ getConnection: async () => 'test-connection' });
      createOracleDbStub({ createPool: createPoolStub });
      const firstResult = connection.getConnection();
      await firstResult.should.eventually.be.fulfilled.and.deep.equal('test-connection');
      const secondResult = connection.getConnection();
      await secondResult.should.eventually.be.fulfilled.and.deep.equal('test-connection');
      createPoolStub.should.have.been.calledOnce.and.always.calledWithMatch({});
    });
  });
});

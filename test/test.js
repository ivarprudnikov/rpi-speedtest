const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app');
const db = require('../db');
const should = chai.should();
chai.use(chaiHttp);

describe('Server', () => {
  it('should return 404', (done) => {
    chai.request(server)
      .get('/')
      .end((err, res) => {
        should.not.exist(err);
        res.should.have.status(404);
        done();
      });
  });
  describe('path /api/v1/speed', () => {
    const path = '/api/v1/speed';
    const payload = {
      down: {
        mbps: 50
      }
    };
    let insertRowStub;
    beforeEach(function () {
      insertRowStub = sinon.stub(db, 'insertRow');
    });
    afterEach(function () {
      insertRowStub.restore();
    });
    it('should accept post', (done) => {
      insertRowStub.returns(Promise.resolve());
      chai.request(server)
        .post(path)
        .send(payload)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(201);
          done();
        });
    });
    it('should accept post and ignore query params', (done) => {
      insertRowStub.returns(Promise.resolve());
      chai.request(server)
        .post(`${path}?foo=bar`)
        .send(payload)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(201);
          done();
        });
    });
    it('should accept post and ignore hash', (done) => {
      insertRowStub.returns(Promise.resolve());
      chai.request(server)
        .post(`${path}#foo`)
        .send(payload)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(201);
          done();
        });
    });
    it('should fail if database insert fails', (done) => {
      insertRowStub.rejects(new Error('foobar'));
      chai.request(server)
        .post(`${path}`)
        .send(payload)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(400);
          done();
        });
    });
    it('should not accept get', (done) => {
      chai.request(server)
        .get(path)
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(404);
          done();
        });
    });
    it('should decline if body too large', (done) => {
      chai.request(server)
        .post(path)
        .send({ x: '0'.repeat(1024 * 1024) })
        .end((err, _) => {
          chai.expect(err.code).to.eq('EPIPE'); // chai error handler is awful
          done();
        });
    });
    it('should decline if body is not json', (done) => {
      chai.request(server)
        .post(path)
        .send('foobar')
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(422);
          done();
        });
    });
  });
});

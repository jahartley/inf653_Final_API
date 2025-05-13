process.env.NODE_ENV = 'test';

import { startTest, shutdownTest, startServer, shutdownServer } from '../index.js';

//Require the dev-dependencies
import * as chai from 'chai';
import { request, default as chaiHttp } from 'chai-http';
const { expect } = chai;

chai.use(chaiHttp);

describe('Test index.js', async () => {
    let server1;
    before(async () => { 
        //await startTest();
        server1 = await request.execute('http://localhost:3000').keepOpen();
    });
    after(async () => {
        //await shutdownTest();
        await server1.close();
    });
    it('it should fail to GET "/"', (done) => {
        server1
        .get('/')
        .end((err, res) => {
            expect(err).not.to.be.null;
            expect(err).to.have.property('errno').that.equals(-111);
            done();
        });
    });
    it('it should start server', async () => {
        await startServer();
    });
    it('it should GET "/" with bad headers and receive 404.', (done) => {
        server1
        .get('/')
        .set('Accept', 'application/xml')
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(404);
            expect(res).to.be.json;
            done();
        });
    });
    it('it should GET "/" and receive homepage.', (done) => {
        server1
        .get('/')
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res.text).to.include('<h1>Welcome to my INF653 Final Project</h1>');
            done();
        });
    });
    it('it should POST "/" and receive homepage.', (done) => {
        server1
        .post('/')
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res.text).to.include('<h1>Welcome to my INF653 Final Project</h1>');
            done();
        });
    });
    it('it should PUT "/" and receive homepage.', (done) => {
        server1
        .put('/')
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res.text).to.include('<h1>Welcome to my INF653 Final Project</h1>');
            done();
        });
    });
    it('it should GET "/yh.gif" and receive 404gif.', (done) => {
        server1
        .get('/yh.gif')
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect(res).to.have.property('type').that.includes('image/gif');
            done();
        });
    });
    it('it should GET "/anything" and receive 404.', (done) => {
        server1
        .get('/anything')
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(404);
            expect(res.text).to.include('<h1>404</h1>');
            done();
        });
    });
    it('it should GET "/anything" with bad headers and receive 404.', (done) => {
        server1
        .get('/anything')
        .set('Accept', 'application/xml')
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(404);
            expect(res).to.be.json;
            done();
        });
    });
    it('it should stop server', async () => {
        await shutdownServer();
    });
    it('it should fail to GET "/"', (done) => {
        server1
        .get('/')
        .end((err, res) => {
            expect(err).not.to.be.null;
            expect(err).to.have.property('errno').that.equals(-111);
            done();
        });
    });
});;
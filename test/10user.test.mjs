
process.env.NODE_ENV = 'test';

import { app, startTest, shutdownTest } from '../index.js';

//Require the dev-dependencies
import * as chai from 'chai';
import { request, default as chaiHttp } from 'chai-http';
const { expect } = chai;

chai.use(chaiHttp);

describe('Test User Routes', async () => {
    let server1;
    before(async () => { 
        await startTest();
    });
    after(async () => {
        await shutdownTest();
    });
    describe('POST /api/auth/register', async () => {
        before(async () => {
            server1 = await request.execute(app).keepOpen();
        });
        after(async () => {
            await server1.close();
        });
        it('it should not register a new user without password', (done) => {
            let user = {
                name: "Judson Hartley",
                email: "test0@jahartley.com",
                role: "admin"
            };
            server1
            .post('/api/auth/register')
            .send(user)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.includes('Bad Request');
                done();
            });
        });
        it('it should not register a new user without name', (done) => {
            let user = {
                email: "test0@jahartley.com",
                password: "admin",
                role: "admin"
            };
            server1
            .post('/api/auth/register')
            .send(user)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.includes('Bad Request');
                done();
            });
        });
        it('it should not register a new user without email', (done) => {
            let user = {
                name: "Judson Hartley",
                password: "admin",
                role: "admin"
            };
            server1
            .post('/api/auth/register')
            .send(user)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.includes('Bad Request');
                done();
            });
        });
        it('it should register a new admin account', (done) => {
            let user = {
                name: "Judson Hartley",
                email: "test0@jahartley.com",
                password: "admin",
                role: "admin"
            };
            server1
            .post('/api/auth/register')
            .send(user)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res.body).to.have.property('name');
                expect(res.body).to.have.property('email');
                expect(res.body).to.have.property('id');
                expect(res.body).to.have.property('role');
                expect(res.body).to.not.have.property('password');
                done();
            });
        });
        it('it should not allow duplicate emails', (done) => {
            let user = {
                name: "Judson Hartley",
                email: "test0@jahartley.com",
                password: "admin",
                role: "admin"
            };
            server1
            .post('/api/auth/register')
            .send(user)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(400);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.includes('Bad Request');
                done();
            });
        });
        it('it Registers a user with default role of user', (done) => {
            let user = {
                name: "Judson Hartley",
                email: "test1@jahartley.com",
                password: "admin",
            };
            server1
            .post('/api/auth/register')
            .send(user)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res.body).to.have.property('name');
                expect(res.body).to.have.property('email');
                expect(res.body).to.have.property('id');
                expect(res.body).to.have.property('role');
                expect(res.body.role).to.include('user');
                expect(res.body.role).to.not.include('admin');
                expect(res.body).to.not.have.property('password');
                done();
            });
        });
        it('it Registers a user with the role of user', (done) => {
            let user = {
                name: "Judson Hartley",
                email: "test2@jahartley.com",
                password: "admin",
                role: "user"
            };
            server1
            .post('/api/auth/register')
            .send(user)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res.body).to.have.property('name');
                expect(res.body).to.have.property('email');
                expect(res.body).to.have.property('id');
                expect(res.body).to.have.property('role');
                expect(res.body.role).to.include('user');
                expect(res.body.role).to.not.include('admin');
                expect(res.body).to.not.have.property('password');
                done();
            });
        });
    });
    describe('POST /api/auth/login', async () => {
        before(async () => {
            server1 = await request.execute(app).keepOpen();
        });
        after(async () => {
            await server1.close();
        });
        it('logs in, returns JWT', (done) => {
            let user = {
                email: "test0@jahartley.com",
                password: "admin"
            };
            server1
            .post('/api/auth/login')
            .send(user)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res).to.have.cookie('token');
                expect(res.body).to.have.property('user');
                expect(res.body.user).to.have.property('name').that.equals('Judson Hartley');
                expect(res.body.user).to.have.property('email').that.equals(user.email);
                expect(res.body).to.not.have.property('message');
                done();
            });
        });
        it('does not login with missing email', (done) => {
            let user = {
                //email: "test0@jahartley.com",
                password: "admin"
            };
            server1
            .post('/api/auth/login')
            .send(user)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(401);
                expect(res).to.be.json;
                expect(res).to.not.have.cookie('token');
                expect(res.body).to.not.have.property('user');
                expect(res.body).to.have.property('message').that.includes('Invalid');
                done();
            });
        });
        it('does not login with missing password', (done) => {
            let user = {
                email: "test0@jahartley.com",
                //password: "admin"
            };
            server1
            .post('/api/auth/login')
            .send(user)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(401);
                expect(res).to.be.json;
                expect(res).to.not.have.cookie('token');
                expect(res.body).to.not.have.property('user');
                expect(res.body).to.have.property('message').that.includes('Invalid');
                done();
            });
        });
        it('does not login with unknown email', (done) => {
            let user = {
                email: "test45@jahartley.com",
                password: "admin"
            };
            server1
            .post('/api/auth/login')
            .send(user)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(401);
                expect(res).to.be.json;
                expect(res).to.not.have.cookie('token');
                expect(res.body).to.not.have.property('user');
                expect(res.body).to.have.property('message').that.includes('Invalid');
                done();
            });
        });
        it('does not login with incorrect password', (done) => {
            let user = {
                email: "test0@jahartley.com",
                password: "admina"
            };
            server1
            .post('/api/auth/login')
            .send(user)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(401);
                expect(res).to.be.json;
                expect(res).to.not.have.cookie('token');
                expect(res.body).to.not.have.property('user');
                expect(res.body).to.have.property('message').that.includes('Invalid');
                done();
            });
        });
    });
});


process.env.NODE_ENV = 'test';

import { app, startTest, shutdownTest } from '../index.js';

//Require the dev-dependencies
import * as chai from 'chai';
import { request, default as chaiHttp } from 'chai-http';
const { expect } = chai;

chai.use(chaiHttp);

describe('Test Event Routes AFTER Bookings', async () => {
    let server1;
    let event1;
    let event2;
    before(async () => { 
        await startTest();
    });
    after(async () => {
        await shutdownTest();
    });
    describe('PUT /api/events/:id', async () => {
        before(async () => {
            server1 = await request.agent(app).keepOpen();
        });
        after(async () => {
            await server1.close();
        });
        it('it should return 2 results', (done) => {
            server1
            .get('/api/events')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.lengthOf(2);
                event2 = res.body[0];
                event1 = res.body[1];
                done();
            });
        });
        it('it verifies that an event is saved from previous tests, increases price', (done) => {
            expect(event2).to.have.property('_id');
            expect(event2).to.have.property('title');
            expect(event2).to.have.property('description');
            expect(event2).to.have.property('category');
            expect(event2).to.have.property('venue');
            expect(event2).to.have.property('date');
            expect(event2).to.have.property('time');
            expect(event2).to.have.property('seatCapacity');
            expect(event2).to.have.property('price');
            done();
            event2.price += 2;
        });
        it('it logs in with admin account, gets admin JWT', (done) => {
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
        it('it updates an event with price increase, everyone gets billed.', (done) => {
            server1
            .put(`/api/events/${event2._id}`)
            .send(event2)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.not.have.property('message');
                expect(res.body).to.have.property('price').that.equals(event2.price);
                done();
            });
        });
        it('it decreases the price price', (done) => {
            expect(event2).to.have.property('_id');
            expect(event2).to.have.property('title');
            expect(event2).to.have.property('description');
            expect(event2).to.have.property('category');
            expect(event2).to.have.property('venue');
            expect(event2).to.have.property('date');
            expect(event2).to.have.property('time');
            expect(event2).to.have.property('seatCapacity');
            expect(event2).to.have.property('price');
            done();
            event2.price -= 8;
        });
        it('it updates an event with price decrease, everyone gets refund.', (done) => {
            server1
            .put(`/api/events/${event2._id}`)
            .send(event2)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.not.have.property('message');
                expect(res.body).to.have.property('price').that.equals(event2.price);
                done();
            });
        });
    });
    describe('DELETE /api/events/:id', async () => {
        before(async () => {
            server1 = await request.agent(app).keepOpen();
            it('it verifies that an eventId is saved from previous tests', (done) => {
                expect(event2._id).to.be.not.null;
                done();
            });
        });
        after(async () => {
            await server1.close();
        });
        it('it logs in with admin account, gets admin JWT', (done) => {
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
        it('it deletes an event with bookings, everyone gets refunds', (done) => {
            server1
            .delete(`/api/events/${event2._id}`)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.includes('Event deleted successfully');
                done();
            });
        });
        it('it deletes an event with bookings, everyone gets refunds', (done) => {
            server1
            .delete(`/api/events/${event1._id}`)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.includes('Event deleted successfully');
                done();
            });
        });
        it('it should return 0 results', (done) => {
            server1
            .get('/api/events')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.include('No Events found');
                done();
            });
        });
    });
});
process.env.NODE_ENV = 'test';

import { app, startTest, shutdownTest } from '../index.js';
import { formatShortDate } from '../utils/utils.js';


//Require the dev-dependencies
import * as chai from 'chai';
import { request, default as chaiHttp } from 'chai-http';
const { expect } = chai;

chai.use(chaiHttp);

describe('Test Bookings Routes', async () => {
    let server1;
    let event1Id;
    let event2Id;
    let booking1Id;
    let booking2Id;
    before(async () => { 
        await startTest();
    });
    after(async () => {
        await shutdownTest();
    });
    describe('GET /api/bookings', async () => {
        before(async () => {
            server1 = await request.agent(app).keepOpen();
        });
        after(async () => {
            await server1.close();
        });
        it('it should not get bookings without a JWT', (done) => {
            server1
            .get('/api/bookings')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(418);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.include('Access denied');
                done();
            });
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
        it('it should not get bookings with an admin JWT', (done) => {
            server1
            .get('/api/bookings')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(403);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.include('Users only');
                done();
            });
        });
        it('it logs in with user account, gets user JWT', (done) => {
            let user = {
                email: "test1@jahartley.com",
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
        it('it should find no bookings because there are none.', (done) => {
            server1
            .get('/api/bookings')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.include('No Bookings found');
                done();
            });
        });
    });
    describe('POST /api/bookings', async () => {
        before(async () => {
            server1 = await request.agent(app).keepOpen();
        });
        after(async () => {
            await server1.close();
        });
        it('Gets prerequisite event Ids', (done) => {
            server1
            .get('/api/events')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.lengthOf(2);
                event1Id = res.body[0]._id;
                event2Id = res.body[1]._id;
                done();
            });
        });
        it('it fails to create a booking with no token', (done) => {
            const booking1 = {
                eventId: event2Id,
                quantity: 4 
            };
            server1
            .post('/api/bookings')
            .send(booking1)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(418);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.include('Access denied');
                done();
            });
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
        it('it fails to create a booking with an admin token', (done) => {
            const booking1 = {
                eventId: event2Id,
                quantity: 4 
            };
            server1
            .post('/api/bookings')
            .send(booking1)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(403);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.include('Users only');
                done();
            });
        });
        it('it logs in with user account, gets user JWT', (done) => {
            let user = {
                email: "test1@jahartley.com",
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
        it('it creates a booking with a user token', (done) => {
            const booking1 = {
                eventId: event2Id,
                quantity: 4 
            };
            server1
            .post('/api/bookings')
            .send(booking1)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res.body).to.have.property('quantity').that.equals(booking1.quantity);
                expect(res.body).to.have.property('event').that.equals(booking1.eventId);
                done();
            });
        });
        it('it fails to creates a second booking with the same user', (done) => {
            const booking1 = {
                eventId: event2Id,
                quantity: 4 
            };
            server1
            .post('/api/bookings')
            .send(booking1)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(409);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.include('You already have a booking for this event');
                done();
            });
        });
        it('it creates a different booking with a user token', (done) => {
            const booking1 = {
                eventId: event1Id,
                quantity: 7 
            };
            server1
            .post('/api/bookings')
            .send(booking1)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res.body).to.have.property('quantity').that.equals(booking1.quantity);
                expect(res.body).to.have.property('event').that.equals(booking1.eventId);
                done();
            });
        });
        it('it logs in with different user account, gets user JWT', (done) => {
            let user = {
                email: "test2@jahartley.com",
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
        it('it fails to create a booking with an invalid eventId', (done) => {
            const booking1 = {
                eventId: '68229dacfcbeecff85b495ec',
                quantity: 4 
            };
            server1
            .post('/api/bookings')
            .send(booking1)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.include('Event not found');
                done();
            });
        });
        it('it fails to create a booking with too many booked seats', (done) => {
            const booking1 = {
                eventId: event2Id,
                quantity: 47 
            };
            server1
            .post('/api/bookings')
            .send(booking1)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(409);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.include('Not enough seats available');
                done();
            });
        });
        it('it fails to create a booking with too many booked seats', (done) => {
            const booking1 = {
                eventId: event2Id,
                quantity: 4 
            };
            server1
            .post('/api/bookings')
            .send(booking1)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(409);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.include('Not enough seats available');
                done();
            });
        });
        it('it creates a booking with a user token', (done) => {
            const booking1 = {
                eventId: event2Id,
                quantity: 3 
            };
            server1
            .post('/api/bookings')
            .send(booking1)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res.body).to.have.property('quantity').that.equals(booking1.quantity);
                expect(res.body).to.have.property('event').that.equals(booking1.eventId);
                done();
            });
        });
    });
    describe('GET /api/bookings', async () => {
        before(async () => {
            server1 = await request.agent(app).keepOpen();
        });
        after(async () => {
            await server1.close();
        });
        it('it logs in with user account, gets user JWT', (done) => {
            let user = {
                email: "test1@jahartley.com",
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
        it('it should get two bookings', (done) => {
            server1
            .get('/api/bookings')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.lengthOf(2);
                expect(res.body[1]).to.have.property('quantity').that.equals(7);
                booking2Id = res.body[1]._id;
                done();
            });
        });
        it('it logs in with a different user account, gets user JWT', (done) => {
            let user = {
                email: "test2@jahartley.com",
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
        it('it should get one booking', (done) => {
            server1
            .get('/api/bookings')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.lengthOf(1);
                expect(res.body[0]).to.have.property('quantity').that.equals(3);
                booking1Id = res.body[0]._id;
                done();
            });
        });
    });
    describe('GET /api/bookings/:id', async () => {
        before(async () => {
            server1 = await request.agent(app).keepOpen();
        });
        after(async () => {
            await server1.close();
        });
        it('it should not get booking by id without a JWT', (done) => {
            server1
            .get(`/api/bookings/${booking1Id}`)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(418);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.include('Access denied');
                done();
            });
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
        it('it should not get booking by id with an admin JWT', (done) => {
            server1
            .get(`/api/bookings/${booking1Id}`)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(403);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.include('Users only');
                done();
            });
        });
        it('it logs in with user account, gets user JWT', (done) => {
            let user = {
                email: "test1@jahartley.com",
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
        it('it should find no booking with incorrect user and booking id combination', (done) => {
            server1
            .get(`/api/bookings/${booking1Id}`)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(403);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.include('Forbidden');
                done();
            });
        });
        it('it should find no booking with invalid id', (done) => {
            server1
            .get(`/api/bookings/68229dacfcbeecff85b495`)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(500);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.include('Cast to ObjectId failed');
                done();
            });
        });
        it('it should find no booking with nonexistent id', (done) => {
            server1
            .get(`/api/bookings/6822aad7465bcc287cb831fa`)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.include('No Booking found');
                done();
            });
        });
        it('it should find a booking with correct userId and bookingId combination', (done) => {
            server1
            .get(`/api/bookings/${booking2Id}`)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.property('_id').that.equals(booking2Id);
                done();
            });
        });
        it('it logs in with user account, gets user JWT', (done) => {
            let user = {
                email: "test2@jahartley.com",
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
        it('it should find a booking with correct userId and bookingId combination', (done) => {
            server1
            .get(`/api/bookings/${booking1Id}`)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.property('_id').that.equals(booking1Id);
                done();
            });
        });
    });
    describe('GET /api/bookings/validate/:qr', async () => {
        before(async () => {
            server1 = await request.agent(app).keepOpen();
        });
        after(async () => {
            await server1.close();
        });
        it('it should get booking validation by qr without a JWT', (done) => {
            server1
            .get(`/api/bookings/validate/${booking1Id}`)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.equals('VALID');
                done();
            });
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
        it('it should get booking validation by qr with admin JWT', (done) => {
            server1
            .get(`/api/bookings/validate/${booking1Id}`)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.equals('VALID');
                done();
            });
        });
        it('it logs in with user account, gets user JWT', (done) => {
            let user = {
                email: "test1@jahartley.com",
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
        it('it should get booking validation by qr with user JWT', (done) => {
            server1
            .get(`/api/bookings/validate/${booking1Id}`)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.equals('VALID');
                done();
            });
        });
        it('it should find no booking with invalid id', (done) => {
            server1
            .get(`/api/bookings/validate/68229dacfcbeecff85b495`)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(500);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.include('Cast to ObjectId failed');
                done();
            });
        });
        it('it should find no booking with nonexistent id', (done) => {
            server1
            .get(`/api/bookings/validate/6822aad7465bcc287cb831fa`)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.include('No Booking found');
                done();
            });
        });
        it('it should find a booking that happens on a different date', (done) => {
            server1
            .get(`/api/bookings/validate/${booking2Id}`)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.equals('VALID, Wrong Date');
                done();
            });
        });
        it('it logs in with user account, gets user JWT', (done) => {
            let user = {
                email: "test2@jahartley.com",
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
        it('it should find a booking that happens on a different date', (done) => {
            server1
            .get(`/api/bookings/validate/${booking2Id}`)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.equals('VALID, Wrong Date');
                done();
            });
        });
    });
});

process.env.NODE_ENV = 'test';

import { app, startTest, shutdownTest } from '../index.js';
import { formatShortDate } from '../utils/utils.js';

//Require the dev-dependencies
import * as chai from 'chai';
import { request, default as chaiHttp } from 'chai-http';
const { expect } = chai;

chai.use(chaiHttp);

describe('Test Event Routes', async () => {
    let server1;
    let eventId;
    let event2;
    before(async () => { 
        await startTest();
    });
    after(async () => {
        await shutdownTest();
    });
    describe('GET /api/events', async () => {
        before(async () => {
            server1 = await request.execute(app).keepOpen();
        });
        after(async () => {
            await server1.close();
        });
        it('it should return an empty array due to no events', (done) => {
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
        it('it should return an empty array due to no events, with a category filter', (done) => {
            server1
            .get('/api/events')
            .query({category: "Folk"})
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.include('No Events found');
                done();
            });
        });
        it('it should return an empty array due to no events, with a date filter', (done) => {
            server1
            .get('/api/events')
            .query({date: "2025-05-08"})
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.include('No Events found');
                done();
            });
        });
        it('it should return an empty array due to no events, with both filters', (done) => {
            server1
            .get('/api/events')
            .query({category: "Folk", date: "2025-05-08"})
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.include('No Events found');
                done();
            });
        });
    });
    describe('POST /api/events', async () => {
        before(async () => {
            server1 = await request.agent(app).keepOpen();
        });
        after(async () => {
            await server1.close();
        });
        it('it fails to create an event with no token', (done) => {
            let event = {
                title: "The Indigestible Pickers play Tony's Pizza Events Center",
                description: "What a Show!",
                category: "Folk",
                venue: "Tony's Pizza Events Center",
                date: "2025-06-09",
                time: "19:00",
                seatCapacity: 7000,
                price: 79.95
            };
            server1
            .post('/api/events')
            .send(event)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(418);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.include('Access denied');
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
        it('it fails to create an event with a user JWT', (done) => {
            let event = {
                title: "The Indigestible Pickers play Tony's Pizza Events Center",
                description: "What a Show!",
                category: "Folk",
                venue: "Tony's Pizza Events Center",
                date: "2025-06-09",
                time: "19:00",
                seatCapacity: 7000,
                price: 79.95
            };
            server1
            .post('/api/events')
            .send(event)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(403);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.include('Admins only');
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
        it('it creates an event with an admin JWT', (done) => {
            let event = {
                title: "The Indigestible Pickers play Tony's Pizza Events Center",
                description: "What a Show!",
                category: "Folk",
                venue: "Tony's Pizza Events Center",
                date: "2025-06-13",
                time: "19:00",
                seatCapacity: 7000,
                price: 79.95
            };
            server1
            .post('/api/events')
            .send(event)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res.body).to.not.have.property('message');
                expect(res.body).to.have.property('title').that.include(event.title);
                expect(res.body).to.have.property('bookedSeats').that.equals(0);
                done();
            });
        });
        it('it creates a second event with an admin JWT', (done) => {
            let event = {
                title: "The Sting Daisies play Orpheum Theater",
                description: "One Night Only!",
                category: "Jazz",
                venue: "Orpheum Theater",
                date: "2025-06-11",
                time: "19:00",
                seatCapacity: 1286,
                price: 145.95
            };
            server1
            .post('/api/events')
            .send(event)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res.body).to.not.have.property('message');
                expect(res.body).to.have.property('title').that.include(event.title);
                expect(res.body).to.have.property('bookedSeats').that.equals(0);
                done();
            });
        });
        it('it creates a third event with an admin JWT', (done) => {
            let event = {
                title: "The Twang Widower plays Bob's Diner",
                description: "One Night Only!",
                category: "Country",
                venue: "Bob's Diner",
                date: formatShortDate(Date.now()),
                time: "19:00",
                seatCapacity: 7,
                price: 2145.95
            };
            server1
            .post('/api/events')
            .send(event)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res.body).to.not.have.property('message');
                expect(res.body).to.have.property('title').that.include(event.title);
                expect(res.body).to.have.property('bookedSeats').that.equals(0);
                done();
            });
        });
    });
    describe('GET /api/events', () => {
        before(async () => {
            server1 = await request.execute(app).keepOpen();
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
                expect(res.body).to.have.lengthOf(3);
                eventId = res.body[0]._id;
                event2 = res.body[1];
                done();
            });
        });
        it('it should return 1 event, with a category filter', (done) => {
            server1
            .get('/api/events')
            .query({category: "Jazz"})
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.lengthOf(1);
                expect(res.body[0]).to.have.property('category').that.equals('Jazz');
                done();
            });
        });
        it('it should return 1 event, with a date filter', (done) => {
            server1
            .get('/api/events')
            .query({date: "2025-06-11"})
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.lengthOf(1);
                done();
            });
        });
        it('it should return an empty array due to no events, with both filters', (done) => {
            server1
            .get('/api/events')
            .query({category: "Folk", date: "2025-05-08"})
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.include('No Events found');
                done();
            });
        });
    });
    describe('GET /api/events:id', () => {
        before(async () => {
            server1 = await request.execute(app).keepOpen();
        });
        after(async () => {
            await server1.close();
        });
        it('it should not find an event due to incorrect id structure', (done) => {
            server1
            .get(`/api/events/27`)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(500);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.includes('Cast to ObjectId');
                done();
            });
        });
        it('it should not find an event due to id that does not exist', (done) => {
            server1
            .get(`/api/events/682241c9dbbff93fe1585a8c`)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(404);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.includes('Event not found');
                done();
            });
        });
        it('it should find the event from the GET /api/events request by ID', (done) => {
            server1
            .get(`/api/events/${eventId}`)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.property('_id').that.includes(eventId);
                done();
            });
        });
    });
    describe('PUT /api/events/:id', async () => {
        before(async () => {
            server1 = await request.agent(app).keepOpen();
            it('it verifies that an event is saved from previous tests', (done) => {
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
                event2.title = "Ambrosial Skid plays the Orpheum"
            });
        });
        after(async () => {
            await server1.close();
        });
        it('it fails to update an event with no token', (done) => {
            server1
            .put(`/api/events/${event2._id}`)
            .send(event2)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(418);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.include('Access denied');
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
        it('it fails to update an event with a user JWT', (done) => {
            server1
            .put(`/api/events/${event2._id}`)
            .send(event2)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(403);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.include('Admins only');
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
        it('it updates an event with an admin JWT', (done) => {
            server1
            .put(`/api/events/${event2._id}`)
            .send(event2)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.not.have.property('message');
                expect(res.body).to.have.property('title').that.include(event2.title);
                expect(res.body).to.have.property('bookedSeats').that.equals(0);
                done();
            });
        });
        it('it should return 3 results', (done) => {
            server1
            .get('/api/events')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.lengthOf(3);
                expect(res.body[0]).to.have.property('_id').that.includes(eventId);
                expect(res.body[1]).to.have.property('_id').that.includes(event2._id);
                done();
            });
        });
    });
    describe('DELETE /api/events/:id', async () => {
        before(async () => {
            server1 = await request.agent(app).keepOpen();
            it('it verifies that an eventId is saved from previous tests', (done) => {
                expect(eventId).to.be.not.null;
                done();
            });
        });
        after(async () => {
            await server1.close();
        });
        it('it fails to delete an event with no token', (done) => {
            server1
            .delete(`/api/events/${event2._id}`)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(418);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.include('Access denied');
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
        it('it fails to delete an event with a user JWT', (done) => {
            server1
            .delete(`/api/events/${event2._id}`)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(403);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message').that.include('Admins only');
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
        it('it deletes an event with an admin JWT', (done) => {
            server1
            .delete(`/api/events/${event2._id}`)
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.property('message');
                done();
            });
        });
        it('it should return 2 results', (done) => {
            server1
            .get('/api/events')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.have.lengthOf(2);
                expect(res.body[0]).to.have.property('_id').that.includes(eventId);
                done();
            });
        });
    });
});
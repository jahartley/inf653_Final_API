
process.env.NODE_ENV = 'test';

import { startTest, shutdownTest } from '../index.js';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Booking from '../models/Booking.js';

//Require the dev-dependencies
import * as chai from 'chai';
const { expect } = chai;

describe('Clear DB before testing', async () => {
    before(async () => { 
        await startTest();
    });
    after(async () => {
        await shutdownTest();
    });
    it('it should clear all users before testing', async () => {
        try {
            let res = await User.deleteMany({});
            expect(res).to.have.property('acknowledged').that.be.true;
        } catch (err) {
            expect(err).to.be.undefined;
            console.error(err);
        }
    });
    it('it should clear all Bookings before testing', async () => {
        try {
            let res = await Booking.deleteMany({});
            expect(res).to.have.property('acknowledged').that.be.true;
        } catch (err) {
            expect(err).to.be.undefined;
            console.error(err);
        }
    });
    it('it should clear all Events before testing', async () => {
        try {
            let res = await Event.deleteMany({});
            expect(res).to.have.property('acknowledged').that.be.true;
        } catch (err) {
            expect(err).to.be.undefined;
            console.error(err);
        }
    });
});
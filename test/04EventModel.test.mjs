process.env.NODE_ENV = 'test';

import { app, startTest, shutdownTest } from '../index.js';
import Event from '../models/Event.js';

//Require the dev-dependencies
import * as chai from 'chai';
const { expect } = chai;

describe('Test Event Validation', async () => {
    before(async () => { 
        await startTest();
    });
    after(async () => {
        await shutdownTest();
    });
    it('it should return a correct event', async () => {
        try {
            const event = new Event({
                title: 'a',
                description: 'a',
                category: 'a',
                venue: 'a',
                date: '2025-01-01',
                time: 'any',
                seatCapacity: 20,
                price: '27'
            });
            let res = await event.save();
            expect(res);
            expect(res).to.have.property('title').that.equals(event.title);
            expect(res).to.have.property('description').that.equals(event.description);
            expect(res).to.have.property('category').that.equals(event.category);
            expect(res).to.have.property('venue').that.equals(event.venue);
            expect(res).to.have.property('time').that.equals(event.time);
            expect(res).to.have.property('seatCapacity').that.equals(event.seatCapacity);
            expect(res).to.have.property('price').that.equals(event.price);
        } catch (error) {
            expect(error).to.be.undefined;
        }
    });
    it('it should error on missing required properties TITLE', async () => {
        try {
            const event = new Event({
                //title: 'a',
                description: 'a',
                category: 'a',
                venue: 'a',
                date: '2025-01-01',
                time: 'any',
                seatCapacity: 20,
                price: '27'
            });
            let res = await event.save();
            expect(res).to.be.undefined;
        } catch (error) {
            expect(error.message).to.include('Event validation failed: title: Path `title` is required')
        }
    });
    it('it should error on missing required properties DATE', async () => {
        try {
            const event = new Event({
                title: 'a',
                description: 'a',
                category: 'a',
                venue: 'a',
                //date: '2025-01-01',
                time: 'any',
                seatCapacity: 20,
                price: '27'
            });
            let res = await event.save();
            expect(res).to.be.undefined;
        } catch (error) {
            expect(error.message).to.include('Event validation failed: date: Path `date` is required.')
        }
    });
    it('it should error on missing required properties PRICE', async () => {
        try {
            const event = new Event({
                title: 'a',
                description: 'a',
                category: 'a',
                venue: 'a',
                date: '2025-01-01',
                time: 'any',
                seatCapacity: 20,
                //price: '27'
            });
            let res = await event.save();
            expect(res).to.be.undefined;
        } catch (error) {
            expect(error.message).to.include('Event validation failed: price: Path `price` is required.')
        }
    });
    it('it should error on missing required properties seatCapacity', async () => {
        try {
            const event = new Event({
                title: 'a',
                description: 'a',
                category: 'a',
                venue: 'a',
                date: '2025-01-01',
                time: 'any',
                //seatCapacity: 20,
                price: '27'
            });
            let res = await event.save();
            expect(res).to.be.undefined;
        } catch (error) {
            expect(error.message).to.include('Event validation failed: seatCapacity: Path `seatCapacity` is required.')
        }
    });
    it('it should error on incorrect required properties seatCapacity', async () => {
        try {
            const event = new Event({
                title: 'a',
                description: 'a',
                category: 'a',
                venue: 'a',
                date: '2025-01-01',
                time: 'any',
                seatCapacity: -5,
                price: '27'
            });
            let res = await event.save();
            expect(res).to.be.undefined;
        } catch (error) {
            expect(error.message).to.include('Event validation failed: seatCapacity: Must have at least one seat')
        }
    });
    it('it should error on incorrect required properties seatCapacity', async () => {
        try {
            const event = new Event({
                title: 'a',
                description: 'a',
                category: 'a',
                venue: 'a',
                date: '2025-01-01',
                time: 'any',
                seatCapacity: 10,
                bookedSeats: 20,
                price: '27'
            });
            let res = await event.save();
            expect(res).to.be.undefined;
        } catch (error) {
            expect(error.message).to.include('Event validation failed: seatCapacity: Must have more seats than bookings')
        }
    });
});
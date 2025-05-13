const mongoose = require('mongoose');

// Per REQ 3.b.
// Per REQ 8.2, validator on seatCapacity.
const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    category: {
        type: String
    },
    venue: {
        type: String
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String
    },
    seatCapacity: {
        type: Number,
        required: true,
        validate: [
            {
                validator: function(value) {
                    if (value < 1) return false;
                    return true;
                }, message: "Must have at least one seat"
            },
            {
                validator: function(value) {
                    if (this.get('bookedSeats') > value) return false;
                    return true;
                }, message: "Must have more seats than bookings"
            }
        ]
    },
    bookedSeats: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        min: 0,
        required: true
    }
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
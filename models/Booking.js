const mongoose = require('mongoose');

// Per REQ 3.c.
const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.ObjectId,
        ref: 'User',
        required: true
    },
    event: {
        type: mongoose.ObjectId,
        ref: 'Event',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    bookingDate: {
        type: Date,
        default: Date.now
    },
    qrCode: {
        type: String
    }
});

const Booking  = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
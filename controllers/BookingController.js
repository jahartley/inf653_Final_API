const Booking = require('../models/Booking');
const Event = require('../models/Event');
const QRCode = require('qrcode');
const sendBooking = require('../utils/email');
const { formatDollars, formatDate } = require('../utils/utils');

exports.createBooking = async (req, res) => {
    // userId, eventId, quantity.
    const { eventId, quantity, bookingDate } = req.body;
    const { userId, email, name } = req.jwt;
    try {

        const existingBooking = await Booking.findOne({ user: userId, event: eventId });

        if (existingBooking) {
            return res.status(409).json({ message: 'You already have a booking for this event' });
        }
        // Per REQ 7.1
        const eventDoc = await Event.findById(eventId);
        if (!eventDoc) {
            return res.status(404).json({ message: 'Event not found' });
        }
        if (eventDoc.seatCapacity < quantity + eventDoc.bookedSeats) {
            return res.status(409).json({ message: 'Not enough seats available' });
        }

        const booking = new Booking({
            user: userId,
            event: eventId,
            quantity,
            bookingDate
        });
        const bookingQr = await booking.save();
        const bookingUrl = process.env.BASE_URL + "/api/bookings/validate/" + bookingQr._id;
        const qrCode = await QRCode.toString(bookingUrl);
        bookingQr.qrCode = qrCode;
        await bookingQr.save();
        // Per REQ 7.2
        eventDoc.bookedSeats += quantity;
        await eventDoc.save();

        // Per REQ 10.c
        let mail = {
            to: `"${name}" <${email}>`,
            subject: `${eventDoc.title} Booking Conformation!`,
            text: `Congratulations on booking ${quantity} seats for ${eventDoc.title}!\nYour Card has been charged ${formatDollars(eventDoc.price * quantity)}\n${eventDoc.title} is on ${formatDate(eventDoc.date)} at ${eventDoc.time}\n\nPlease use this code to check in at the event:\n\n\n\n${booking.qrCode}`, // plain‑text body
            html: `<h1>Congratulations on booking ${quantity} seats for ${eventDoc.title}!</h1><p>Your Card has been charged ${formatDollars(eventDoc.price * quantity)}</p><p>${eventDoc.title} is on ${formatDate(eventDoc.date)} at ${eventDoc.time}</p><p>Please use this code to check in at the event:</p><p><pre>${booking.qrCode}</pre></p>`, // HTML body
        };
        sendBooking(mail);
        res.status(201).json(bookingQr);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Per REQ 6.e
exports.getAllBookings = async (req, res) => {
    const { userId } = req.jwt;
    try {
        const bookings = await Booking.find({user: userId}).populate('event', 'title description category venue date time price');
        if (bookings.length < 1) {
            return res.status(404).json({ message: 'No Bookings found' });
        }
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Per REQ 6.f
exports.getBookingById = async (req, res) => {
    const id = req.params.id;
    const { userId } = req.jwt;
    if (!id) {
        return res.status(400).json({ message: "Booking ID required" });
    }
    try {
        const booking = await Booking.findById(id).populate('event', 'title description category venue date time price');
        if (!booking) {
            return res.status(404).json({ message: 'No Booking found' });
        }
        if (booking.user.toString() !== userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Per REQ 10.b
exports.validateBooking = async (req, res) => {
    const id = req.params.qr;
    if (!id) {
        return res.status(400).json({ message: "Booking ID required" });
    }
    try {
        const booking = await Booking.findById(id).populate('event', 'date');
        if (!booking) {
            return res.status(404).json({ message: 'No Booking found' });
        }
        const booking1Date = new Date(booking.event.date);
        if (booking1Date.valueOf() - 86400000 > Date.now() || booking1Date.valueOf() + 86400000 < Date.now()) {
            return res.status(200).json({ message: 'VALID, Wrong Date' });
        }
        res.status(200).json({message: 'VALID'});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
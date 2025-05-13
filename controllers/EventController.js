const Event = require('../models/Event');
const Booking = require('../models/Booking');
const sendBooking = require('../utils/email');
const QRCode = require('qrcode');
const { formatDate, formatDollars }  = require('../utils/utils');

// Per REQ 7.c, 7.3
exports.createEvent = async (req, res) => {
    const { title, description, category, venue, date, time, seatCapacity, price } = req.body;
    // required: title, date, seatCapacity, price
    if (!title) {
        return res.status(400).json({ message: "Event Title required" });
    }
    if (!date) {
        return res.status(400).json({ message: "Event Date required" });
    }
    if (!seatCapacity) {
        return res.status(400).json({ message: "Event Seat Capacity required" });
    }
    if (!price) {
        return res.status(400).json({ message: "Event Price required" });
    }
    try {
        const event = new Event({
            title,
            description,
            category,
            venue,
            date,
            time,
            seatCapacity,
            price
        });
        await event.save();
        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Per REQ 6.b
exports.getEventById = async (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ message: "Event ID required" });
    }
    try {
        const event = await Event.findById(id).lean();
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Per REQ 6.a, 6.c, 6.d, 6.1, 6.2, 6.3
exports.getAllEvents = async (req, res) => {
    const category = req.query.category;
    const date = req.query.date;
    try {
        let query = {};
        if (category) {
            query.category = category;
        }
        if (date) {
            query.date = {
                $gte: new Date(new Date(date).setHours(0, 0, 0) - 24 * 60 * 60 * 1000),
                $lte: new Date(new Date(date).setHours(23, 59, 59, 999) + 24 * 60 * 60 * 1000),
            };
        }
        const events = await Event.find(query).lean();
        if (events.length < 1) {
            return res.status(404).json({ message: 'No Events found' });
        }
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

bookingPriceChange = async (eventId, oldPrice, newPrice) => {
    let priceDiff = newPrice - oldPrice;
    if (priceDiff == 0) return;
    try {
        let event = await Event.findById(eventId);
        if (!event) {
            throw new Error(`Event ID ${eventId} is missing!`);
        }
        const bookings = await Booking.find({ event: eventId }).populate('user');
        bookings.forEach(async booking => {
            let message;
            let subject;
            if (priceDiff > 0) { //bill more.
                subject = `${event.title} price increase, your card will be charged`
                message = `There has been a price change for your booking at ${event.title}, and you now owe ${formatDollars(priceDiff * booking.quantity)}, which will be charged to your card.`;
            } else {
                subject = `${event.title} price decrease, you will be refunded`
                message = `There has been a price change for your booking at ${event.title}, and you will be refunded ${formatDollars(Math.abs(priceDiff) * booking.quantity)}, via your card, within 575 days.`;
            }
            let mail = {
                to: `"${booking.user[0].name}" <${booking.user[0].email}>`,
                subject: subject,
                text: `${message}\n\n\nPlease use this code to check in:\n\n\n\n${booking.qrCode}`, // plain‑text body
                html: `<h1>${message}</h1><p>Please use this code to check in:</p><p><pre>${booking.qrCode}</pre></p>`, // HTML body
            };
            sendBooking(mail);
        });
    } catch (error) {
        console.log('EventController.js bookingPriceChange ERROR');
        console.error(error);
    }
};

// Per REQ 8.a, 8.1, 8.2
exports.updateEventById = async (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ message: "Event ID required" });
    }
    const { title, description, category, venue, date, time, seatCapacity, price } = req.body;
    try {
        let origEvent = null;
        if (price) {
            origEvent = await Event.findById(id).lean();
            if (!origEvent) {
                return res.status(404).json({ message: 'Event not found' });
            }
        }
        const event = await Event.findByIdAndUpdate(id, { title, description, category, venue, date, time, seatCapacity, price }, { new: true, runValidators: true });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        // Give refund or Bill due to price change.
        if (price && event.price != origEvent.price && origEvent.bookedSeats > 0) {
            bookingPriceChange(id, origEvent.price, event.price);
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



exports.deleteEventById = async (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).json({ message: "Event ID required" });
    }
    try {
        let event = await Event.findById(id);
        //if (event.bookedSeats > 0) return res.status(403).json({ message: 'Event has bookings, cannot delete' });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        let emailsSent = 0;
        if (event.bookedSeats > 0) {
            const bookings = await Booking.find({ event: id }).populate('user');
            const promises = bookings.map(async (bookinga) => {
                try {
                    subject = `${event.title} canceled, you will be refunded`
                    message = `${event.title} has been canceled, and you will be refunded ${formatDollars(event.price * bookinga.quantity)}, via your card, within 575 days.`;
                let mail = {
                    to: `"${bookinga.user.name}" <${bookinga.user.email}>`,
                    subject: subject,
                    text: message, // plain‑text body
                    html: `<p>${message}</p>`, // HTML body
                };
                let res1 = await Booking.findOneAndDelete({_id: bookinga._id.toString()});
                let res2 = await sendBooking(mail);
                emailsSent++;
                return;
                } catch (error) {
                    res.status(500).json({ message: error.message });
                }
            })
            await Promise.all(promises);
            const bookingResult = await Booking.find({event: id});
            if (bookingResult.length > 0) {
                return res.status(403).json({ message: 'Event has bookings, cannot delete' });
            }
        }
        event = await Event.findByIdAndDelete(id);
        res.json({ message: `Event deleted successfully, ${emailsSent} emails sent.` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
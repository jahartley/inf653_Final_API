const express = require('express');
const { createBooking, getAllBookings, getBookingById, updateBookingById, deleteBookingByID, validateBooking } = require('../../controllers/BookingController');

const router = express.Router();
const verifyJWT = require('../../middleware/jwt');

// Per REQ 7.d
router.post('/', verifyJWT, (req, res) => {
    if (!req.jwt.userId || !req.jwt.role.includes('user')) {
        return res.status(403).json({ message: 'Users only' });
    }
    createBooking(req, res);
});

// Per REQ 6.e
router.get('/', verifyJWT, (req, res) => {
    if (!req.jwt.userId || !req.jwt.role.includes('user')) {
        return res.status(403).json({ message: 'Users only' });
    }
    getAllBookings(req, res);
});

// Per REQ 6.f
router.get('/:id', verifyJWT, (req, res) => {
    if (!req.jwt.userId || !req.jwt.role.includes('user')) {
        return res.status(403).json({ message: 'Users only' });
    }
    getBookingById(req,res);
});

// Per REQ 10.b
router.get('/validate/:qr', validateBooking);


module.exports = router;
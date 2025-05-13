const express = require('express');
const { createEvent, getEventById, getAllEvents, updateEventById, deleteEventById } = require('../../controllers/EventController');

const router = express.Router();
const verifyJWT = require('../../middleware/jwt');

// Per REQ 6.a, 6.c, 6.d
router.get('/', getAllEvents);

router.get('/:id', getEventById);

// Per REQ 7.c, 7.3
router.post('/', verifyJWT, (req, res) => {
    if (!req.jwt.userId || !req.jwt.role.includes('admin')) {
        return res.status(403).json({ message: 'Admins only' });
    }
    createEvent(req, res);
});

// Per REQ 8.a,
router.put('/:id', verifyJWT, (req, res) => {
    if (!req.jwt.userId || !req.jwt.role.includes('admin')) {
        return res.status(403).json({ message: 'Admins only' });
    }
    updateEventById(req, res);
});

// Per REQ 9.a
router.delete('/:id', verifyJWT, (req, res) => {
    if (!req.jwt.userId || !req.jwt.role.includes('admin')) {
        return res.status(403).json({ message: 'Admins only' });
    }
    deleteEventById(req, res);
});

module.exports = router;
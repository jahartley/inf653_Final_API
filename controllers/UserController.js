const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Per REQ 7.a
exports.createUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    // prevent user enumeration attacks...
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Bad Request' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10); //salt 10 rounds.
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role
        });
        const response = await user.save();
        // DO NOT GIVE OUT PASSWORD, even hashed.
        const response2 = {
            name: response.name,
            email: response.email,
            id: response._id,
            role: response.role
        };
        res.status(201).json(response2);
    } catch (error) {
        // prevent user enumeration attacks...
        if (error?.code == 11000 && error?.keyPattern?.email) { //email in use...
            return res.status(400).json({ message: 'Bad Request' });
        }
        res.status(500).json({ message: error.message });
    }
};

// Per REQ 7.b, 7.3
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Per REQ 7.3, make JWT, give as httpOnly cookie, 2 hour time limit, for both JWT and cookie. 
        // Per REQ 4.a, Use JWT_SECRET .env variable.
        const token = jwt.sign({ userId: user._id, role: user.role, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '2h' });
        res.cookie('token', token, {maxAge: 2 * 60 * 60 * 1000, httpOnly: true})
        .json({ user: { name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
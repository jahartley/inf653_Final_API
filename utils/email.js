const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendBooking (booking) {

    try {
        if (!booking.to) throw new Error("Missing to");
        if (!booking.subject) throw new Error("Missing subject");
        if (!booking.text) throw new Error("Missing text");
        if (!booking.html) throw new Error("Missing html");
        booking.from = '"NodeMailer" <inf653@jahartley.com>';
        //const info = await transporter.sendMail(booking);
    } catch (error) {
        console.error(error);
    }
};

module.exports = sendBooking;
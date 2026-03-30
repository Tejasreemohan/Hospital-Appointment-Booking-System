import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const mailOptions = {
    from: `Test <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: 'Test Email',
    text: 'If you get this, email sending works.',
};

transporter.sendMail(mailOptions)
    .then(info => console.log('Email sent:', info.response))
    .catch(err => console.error('Error sending email:', err));
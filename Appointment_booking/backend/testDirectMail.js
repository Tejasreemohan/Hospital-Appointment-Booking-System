import dotenv from 'dotenv';
dotenv.config();
import sendEmail from './utils/emailService.js';

async function test() {
    try {
        await sendEmail({
            email: 'tejasreemohan63@gmail.com',
            subject: 'Test Email Direct',
            message: 'This is a test to see if mail arrives.'
        });
        console.log("Email sent successfully!");
    } catch (e) {
        console.error("Failed:", e);
    }
}
test();
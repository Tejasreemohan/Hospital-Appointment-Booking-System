import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Appointment from './models/Appointment.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const testFetch = async () => {
    try {
        console.log("Fetching appointments...");
        const appointments = await Appointment.find({})
            .populate({ path: 'hospital', select: 'name location', strictPopulate: false })
            .sort({ date: -1, timeSlot: -1 });

        console.log("Success! Found:", appointments.length);
        console.log(appointments);
        process.exit(0);
    } catch (err) {
        console.error("Crash Error:", err.message);
        console.error(err.stack);
        process.exit(1);
    }
}

testFetch();

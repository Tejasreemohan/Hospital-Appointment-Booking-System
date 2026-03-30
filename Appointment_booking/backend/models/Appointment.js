import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Hospital',
    },
    service: {
        name: { type: String, required: true }
    },
    date: {
        type: Date,
        required: true,
    },
    timeSlot: {
        type: String,
        required: true,
        // Format "HH:MM" e.g., "10:00"
    },
    status: {
        type: String,
        required: true,
        enum: ['Booked', 'Cancelled', 'Completed', 'Pending'],
        default: 'Booked',
    }
}, {
    timestamps: true
});

// We can add an index to quickly count bookings for a specific slot
appointmentSchema.index({ hospital: 1, date: 1, timeSlot: 1, status: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;

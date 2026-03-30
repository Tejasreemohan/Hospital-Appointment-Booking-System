import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema({
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Hospital',
    },
    date: {
        type: Date,
        required: true,
    },
    timeSlot: {
        type: String,
        required: true,
    },
    bookedCount: {
        type: Number,
        default: 0,
        min: 0
    },
    maxCapacity: {
        type: Number,
        default: 10,
    }
}, {
    timestamps: true
});

// A specific time slot for a hospital on a specific date must be unique
timeSlotSchema.index({ hospital: 1, date: 1, timeSlot: 1 }, { unique: true });

const TimeSlot = mongoose.model('TimeSlot', timeSlotSchema);

export default TimeSlot;

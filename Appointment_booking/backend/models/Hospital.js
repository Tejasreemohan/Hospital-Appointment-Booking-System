import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    location: {
        city: { type: String, required: true },
        address: { type: String, required: true },
        coordinates: {
            lat: { type: Number },
            lng: { type: Number }
        }
    },
    services: [{
        name: { type: String, required: true },
        description: { type: String },
        durationMinutes: { type: Number, default: 30 }
    }],
    contactEmail: {
        type: String
    },
    contactPhone: {
        type: String
    }
}, {
    timestamps: true
});

const Hospital = mongoose.model('Hospital', hospitalSchema);

export default Hospital;

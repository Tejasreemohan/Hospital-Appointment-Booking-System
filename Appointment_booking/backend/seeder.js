import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Hospital from './models/Hospital.js';
import Appointment from './models/Appointment.js';
import TimeSlot from './models/TimeSlot.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const hospitalsData = [
    {
        name: 'Apollo Spectra Hospital',
        location: {
            city: 'Hyderabad',
            address: 'Jubilee Hills, Hyderabad, Telangana',
            coordinates: { lat: 17.4300, lng: 78.4063 }
        },
        services: [
            { name: 'Cardiology', description: 'Heart and vascular care', durationMinutes: 45 },
            { name: 'Neurology', description: 'Brain and nervous system', durationMinutes: 60 },
            { name: 'General Checkup', description: 'Comprehensive physical examination', durationMinutes: 30 }
        ],
        contactEmail: 'contact@apollospectra.com',
        contactPhone: '+91 800-123-4567'
    },
    {
        name: 'MedCare Super Specialty',
        location: {
            city: 'Mumbai',
            address: 'Bandra West, Mumbai, Maharashtra',
            coordinates: { lat: 19.0596, lng: 72.8295 }
        },
        services: [
            { name: 'Pediatrics', description: 'Child care and vaccination', durationMinutes: 30 },
            { name: 'Orthopedics', description: 'Bone and joint care', durationMinutes: 45 },
            { name: 'Dermatology', description: 'Skin health and treatment', durationMinutes: 30 }
        ],
        contactEmail: 'info@medcare.com',
        contactPhone: '+91 800-987-6543'
    },
    {
        name: 'City General Hospital',
        location: {
            city: 'Delhi',
            address: 'Cannaught Place, New Delhi',
            coordinates: { lat: 28.6315, lng: 77.2167 }
        },
        services: [
            { name: 'Dental Care', description: 'Teeth scaling and checkup', durationMinutes: 30 },
            { name: 'Ophthalmology', description: 'Eye exams and consultation', durationMinutes: 30 },
            { name: 'ENT Specialist', description: 'Ear, nose, and throat treatment', durationMinutes: 30 }
        ],
        contactEmail: 'helpdesk@citygeneral.com',
        contactPhone: '+91 800-555-0199'
    },
    {
        name: 'Galaxy Healthcare Campus',
        location: {
            city: 'Bangalore',
            address: 'Koramangala, Bangalore, Karnataka',
            coordinates: { lat: 12.9352, lng: 77.6245 }
        },
        services: [
            { name: 'Psychiatry', description: 'Mental health and therapy', durationMinutes: 60 },
            { name: 'Gynecology', description: 'Women health services', durationMinutes: 45 },
            { name: 'Physiotherapy', description: 'Physical rehabilitation', durationMinutes: 45 }
        ],
        contactEmail: 'care@galaxyhealth.com',
        contactPhone: '+91 800-444-2222'
    },
    {
        name: 'Aura Premium Clinic',
        location: {
            city: 'Chennai',
            address: 'Adyar, Chennai, Tamil Nadu',
            coordinates: { lat: 13.0033, lng: 80.2555 }
        },
        services: [
            { name: 'Diabetology', description: 'Diabetes management', durationMinutes: 30 },
            { name: 'Gastroenterology', description: 'Digestive system care', durationMinutes: 45 },
            { name: 'General Physician', description: 'Fever and common illnesses', durationMinutes: 20 }
        ],
        contactEmail: 'aura@premiumclinic.in',
        contactPhone: '+91 800-777-8888'
    }
];

const seedData = async () => {
    try {
        await Hospital.deleteMany();
        console.log('Hospitals cleared!');

        // Optional: clear out appointments matching bad hospital references or all. Here we clear all to reset testing smoothly.
        await Appointment.deleteMany();
        console.log('Appointments cleared!');

        await TimeSlot.deleteMany();
        console.log('Time slots cleared!');

        const createdHospitals = await Hospital.insertMany(hospitalsData);
        console.log(`Successfully seeded ${createdHospitals.length} hospitals!`);

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedData();

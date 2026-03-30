import Hospital from '../models/Hospital.js';

// @desc    Get all hospitals or search by city
// @route   GET /api/hospitals
// @access  Public
export const getHospitals = async (req, res) => {
    const { city } = req.query;

    try {
        const query = {};
        if (city) {
            // Case-insensitive regex search for city
            query['location.city'] = { $regex: new RegExp(city, 'i') };
        }

        const hospitals = await Hospital.find(query);
        res.status(200).json(hospitals);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching hospitals' });
    }
};

// @desc    Get single hospital details and services
// @route   GET /api/hospitals/:id
// @access  Public
export const getHospitalDetails = async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id);

        if (!hospital) {
            return res.status(404).json({ message: 'Hospital not found' });
        }

        res.status(200).json(hospital);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching hospital details' });
    }
};

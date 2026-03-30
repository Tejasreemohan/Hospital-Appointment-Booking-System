import User from '../models/User.js';
import Appointment from '../models/Appointment.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching users' });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            if (user.role === 'Admin') {
                return res.status(400).json({ message: 'Cannot delete admin user' });
            }
            await user.deleteOne();

            // Delete all appointments associated with this user
            await Appointment.deleteMany({ user: req.params.id });

            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error deleting user' });
    }
};

// @desc    Get all appointments
// @route   GET /api/admin/appointments
// @access  Private/Admin
export const getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({})
            .populate('user', 'name email')
            .populate('hospital', 'name location')
            .sort({ date: -1, timeSlot: 1 });
        res.json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching appointments' });
    }
};

// @desc    Update appointment status
// @route   PUT /api/admin/appointments/:id/status
// @access  Private/Admin
export const updateAppointmentStatusAdmin = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Booked', 'Cancelled', 'Completed', 'Pending'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const appointment = await Appointment.findById(req.params.id);

        if (appointment) {
            appointment.status = status;
            const updatedAppointment = await appointment.save();
            res.json(updatedAppointment);
        } else {
            res.status(404).json({ message: 'Appointment not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error updating appointment' });
    }
};

// @desc    Delete appointment
// @route   DELETE /api/admin/appointments/:id
// @access  Private/Admin
export const deleteAppointmentAdmin = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (appointment) {
            await appointment.deleteOne();
            res.json({ message: 'Appointment removed' });
        } else {
            res.status(404).json({ message: 'Appointment not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error deleting appointment' });
    }
};

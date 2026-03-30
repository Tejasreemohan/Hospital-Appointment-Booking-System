import Appointment from '../models/Appointment.js';
import Hospital from '../models/Hospital.js';
import User from '../models/User.js';
import TimeSlot from '../models/TimeSlot.js';
import generateAppointmentPDF from '../utils/pdfGenerator.js';
import sendEmail from '../utils/emailService.js';
import mongoose from 'mongoose';

// Configuration for maximum capacity per time slot globally
const MAX_CAPACITY_PER_SLOT = 10;

// @desc    Get available slots for a given hospital, service, and date
// @route   GET /api/appointments/slots
// @access  Public (or Private)
export const getAvailableSlots = async (req, res) => {
    const { hospitalId, date } = req.query;

    if (!hospitalId || !date) {
        return res.status(400).json({ message: 'Hospital ID and Date are required' });
    }

    try {
        // Generate all operational time slots (e.g., 09:00 to 17:00 every 30 mins)
        const generateAllSlots = () => {
            const slots = [];
            let startHour = 9;
            let startMin = 0;
            while (startHour < 17) {
                let hr = startHour.toString().padStart(2, '0');
                let mn = startMin === 0 ? '00' : '30';
                slots.push(`${hr}:${mn}`);

                startMin += 30;
                if (startMin >= 60) {
                    startHour += 1;
                    startMin = 0;
                }
            }
            return slots;
        };

        const allSlots = generateAllSlots();

        // Parse the requested date to cover the whole day
        const queryDate = new Date(date);
        queryDate.setHours(0, 0, 0, 0);
        const endDate = new Date(queryDate);
        endDate.setDate(queryDate.getDate() + 1);

        // Find all time slots for this hospital on this date from the new TimeSlot model
        const slotsRecord = await TimeSlot.find({
            hospital: hospitalId,
            date: { $gte: queryDate, $lt: endDate }
        }).lean();

        // Tally up bookings per slot using bookedCount field
        const slotCounts = {};
        slotsRecord.forEach(slot => {
            slotCounts[slot.timeSlot] = slot.bookedCount;
        });

        // Check availability against MAX_CAPACITY_PER_SLOT
        const availability = allSlots.map(slot => {
            const count = slotCounts[slot] || 0;
            return {
                timeSlot: slot,
                available: count < MAX_CAPACITY_PER_SLOT,
                currentBookings: count
            };
        });

        res.status(200).json(availability);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private
export const createAppointment = async (req, res) => {
    const { user, hospital, service, date, timeSlot } = req.body;

    if (!user || !hospital || !service || !date || !timeSlot) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Parse the date precisely to match
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);
    const endDate = new Date(bookingDate);
    endDate.setDate(bookingDate.getDate() + 1);

    try {
        // Atomic Capacity Check & Increment
        let slotRecord;
        try {
            slotRecord = await TimeSlot.findOneAndUpdate(
                {
                    hospital: hospital,
                    date: bookingDate,
                    timeSlot: timeSlot,
                    bookedCount: { $lt: MAX_CAPACITY_PER_SLOT }
                },
                {
                    $inc: { bookedCount: 1 },
                    $setOnInsert: { maxCapacity: MAX_CAPACITY_PER_SLOT }
                },
                { new: true, upsert: true }
            );
        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({
                    message: 'This time slot is fully booked. Maximum capacity reached.'
                });
            }
            throw error;
        }

        if (!slotRecord) {
            return res.status(400).json({
                message: 'This time slot is fully booked. Maximum capacity reached.'
            });
        }

        // Optionally check if user already has an active booking at the same time
        const userConflict = await Appointment.findOne({
            user: user,
            date: { $gte: bookingDate, $lt: endDate },
            timeSlot: timeSlot,
            status: 'Booked'
        });

        if (userConflict) {
            return res.status(400).json({ message: 'You already have an appointment at this time.' });
        }

        const newAppointment = await Appointment.create({
            user,
            hospital,
            service,
            date: bookingDate,
            timeSlot,
            status: 'Booked'
        });

        try {
            const populatedAppointment = await Appointment.findById(newAppointment._id)
                .populate('user', 'name email')
                .populate('hospital', 'name location');

            if (populatedAppointment && populatedAppointment.user && populatedAppointment.user.email) {
                const emailMessage = `Dear ${populatedAppointment.user.name},\n\nYour appointment has been successfully booked.\n\nDetails:\nBooking ID: ${populatedAppointment._id}\nHospital: ${populatedAppointment.hospital.name}\nService: ${populatedAppointment.service.name}\nDate: ${new Date(populatedAppointment.date).toLocaleDateString()}\nTime Slot: ${populatedAppointment.timeSlot}\n\nThank you for using our service!`;

                await sendEmail({
                    email: populatedAppointment.user.email,
                    subject: 'Appointment Booking Confirmation',
                    message: emailMessage
                });
            }
        } catch (emailError) {
            console.error('Error sending confirmation email:', emailError);
            // Do not fail the booking if email fails
        }

        res.status(201).json(newAppointment);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error placing booking' });
    }
};

// @desc    Get user appointments
// @route   GET /api/appointments/user/:userId
// @access  Private
export const getUserAppointments = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check if the user ID is a valid MongoDB ObjectId
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid User ID format' });
        }

        const appointments = await Appointment.find({ user: userId })
            .populate({ path: 'hospital', select: 'name location', strictPopulate: false })
            .populate({ path: 'user', select: 'name email' })
            .sort({ date: -1, timeSlot: -1 });

        // Filter out appointments where the hospital might have been deleted (optional, or just return them)
        const validAppointments = appointments.filter(app => app.hospital != null);

        res.status(200).json(validAppointments.length > 0 ? validAppointments : appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ message: 'Server error retrieving appointments', error: error.message });
    }
};

// @desc    Update/Cancel an appointment
// @route   PUT /api/appointments/:id/status
// @access  Private
export const updateAppointmentStatus = async (req, res) => {
    const { status } = req.body;

    if (!['Booked', 'Cancelled', 'Completed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        const oldStatus = appointment.status;

        // If status isn't actually changing, do nothing
        if (oldStatus === status) {
            return res.status(200).json({ success: true, message: 'Status unchanged', appointment });
        }

        // Handle Capacity Changes
        // Rule: Only "Cancelled" frees up a slot. "Booked" and "Completed" consume a slot.
        const oldConsumedSlot = oldStatus === 'Booked' || oldStatus === 'Completed';
        const newConsumesSlot = status === 'Booked' || status === 'Completed';

        if (oldConsumedSlot && !newConsumesSlot) {
            // E.g., Booked/Completed -> Cancelled
            // Decrement capacity
            await TimeSlot.findOneAndUpdate(
                { hospital: appointment.hospital, date: appointment.date, timeSlot: appointment.timeSlot },
                { $inc: { bookedCount: -1 } }
            );
        } else if (!oldConsumedSlot && newConsumesSlot) {
            // E.g., Cancelled -> Booked/Completed
            // Increment capacity, but we need to check if it's full first
            const slotRecord = await TimeSlot.findOneAndUpdate(
                {
                    hospital: appointment.hospital,
                    date: appointment.date,
                    timeSlot: appointment.timeSlot,
                    bookedCount: { $lt: MAX_CAPACITY_PER_SLOT }
                },
                {
                    $inc: { bookedCount: 1 },
                    $setOnInsert: { maxCapacity: MAX_CAPACITY_PER_SLOT }
                },
                { new: true, upsert: true }
            ).catch(error => {
                if (error.code === 11000) return null; // Capacity reached
                throw error;
            });

            if (!slotRecord) {
                return res.status(400).json({ message: 'Cannot update status. The time slot is currently fully booked.' });
            }
        }

        appointment.status = status;
        await appointment.save();

        res.status(200).json({ success: true, message: 'Status updated', appointment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating appointment' });
    }
};

// @desc    Cancel an appointment specific for patient action
// @route   PUT /api/appointments/cancel/:id
// @access  Private
export const cancelAppointmentPatient = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        const oldStatus = appointment.status;

        if (oldStatus === 'Cancelled') {
            return res.status(400).json({ message: 'Appointment is already cancelled' });
        }

        // Only decrement slot if it was previously taking up capacity
        if (oldStatus === 'Booked' || oldStatus === 'Completed') {
            await TimeSlot.findOneAndUpdate(
                { hospital: appointment.hospital, date: appointment.date, timeSlot: appointment.timeSlot },
                { $inc: { bookedCount: -1 } }
            );
        }

        appointment.status = 'Cancelled';
        await appointment.save();

        res.status(200).json({ success: true, message: 'Appointment cancelled successfully', appointment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error cancelling appointment' });
    }
};

// @desc    Update Appointment Details (patientName, date, timeSlot, service)
// @route   PUT /api/appointments/:id
// @access  Private
export const updateAppointment = async (req, res) => {
    const { id } = req.params;
    const { patientName, date, timeSlot, service } = req.body;

    try {
        // 1. Validate appointment exists
        const appointment = await Appointment.findById(id).populate('user');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Only allow updating if it hasn't been completed or cancelled
        if (appointment.status !== 'Booked') {
            return res.status(400).json({
                message: `Cannot update an appointment that is ${appointment.status.toLowerCase()}`
            });
        }

        // Parse new date precisely if provided
        let newBookingDate = appointment.date;
        if (date) {
            newBookingDate = new Date(date);
            newBookingDate.setHours(0, 0, 0, 0);
        }

        const newTimeSlot = timeSlot || appointment.timeSlot;

        // 2. Check if Date or TimeSlot is changing requiring capacity logic
        const isChangingTime = (
            date && newBookingDate.getTime() !== appointment.date.getTime() ||
            timeSlot && timeSlot !== appointment.timeSlot
        );

        if (isChangingTime) {
            const endDate = new Date(newBookingDate);
            endDate.setDate(newBookingDate.getDate() + 1);

            // Capacity Check using TimeSlot for the NEW slot
            let newSlotRecord;
            try {
                newSlotRecord = await TimeSlot.findOneAndUpdate(
                    { hospital: appointment.hospital, date: newBookingDate, timeSlot: newTimeSlot, bookedCount: { $lt: MAX_CAPACITY_PER_SLOT } },
                    { $inc: { bookedCount: 1 }, $setOnInsert: { maxCapacity: MAX_CAPACITY_PER_SLOT } },
                    { new: true, upsert: true }
                );
            } catch (error) {
                if (error.code === 11000) {
                    return res.status(400).json({ message: 'The requested time slot is fully booked.' });
                }
                throw error;
            }

            if (!newSlotRecord) {
                return res.status(400).json({ message: 'The requested time slot is fully booked.' });
            }

            // Decrement old slot booked count
            await TimeSlot.findOneAndUpdate(
                { hospital: appointment.hospital, date: appointment.date, timeSlot: appointment.timeSlot },
                { $inc: { bookedCount: -1 } }
            );

            appointment.date = newBookingDate;
            appointment.timeSlot = newTimeSlot;
        }

        // 3. Update other fields
        if (service) {
            appointment.service.name = service.name || service;
        }

        // Update the patient name on the associated User model if provided
        if (patientName && appointment.user) {
            const user = await User.findById(appointment.user._id);
            if (user) {
                user.name = patientName;
                await user.save();
            }
        }

        // Save the updated appointment
        await appointment.save();

        // Re-populate to return full updated data
        const updatedAppointment = await Appointment.findById(id)
            .populate('user', 'name email')
            .populate('hospital', 'name location');

        res.status(200).json({
            success: true,
            message: 'Appointment updated successfully',
            appointment: updatedAppointment
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating appointment details' });
    }
};

// @desc    Download Appointment PDF
// @route   GET /api/appointments/:id/pdf
// @access  Private
export const downloadAppointmentPDF = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('user', 'name email')
            .populate('hospital', 'name location');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        generateAppointmentPDF(appointment, res);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error generating PDF' });
    }
};

// @desc    Delete/Cancel an appointment
// @route   DELETE /api/appointments/:id
// @access  Private
export const deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        const oldStatus = appointment.status;

        // Don't do anything if it's already cancelled
        if (oldStatus === 'Cancelled') {
            return res.status(400).json({ message: 'Appointment is already cancelled' });
        }

        // Update status to Cancelled to free up capacity
        appointment.status = 'Cancelled';
        await appointment.save();

        if (appointment.hospital && appointment.date && appointment.timeSlot) {
            await TimeSlot.findOneAndUpdate(
                { hospital: appointment.hospital, date: appointment.date, timeSlot: appointment.timeSlot },
                { $inc: { bookedCount: -1 } }
            );
        }

        res.status(200).json({ success: true, message: 'Appointment cancelled successfully', appointment });
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(500).json({ message: 'Server error cancelling appointment', error: error.message });
    }
};

// @desc    Permanently delete an appointment
// @route   DELETE /api/admin/appointments/:id
// @access  Private/Admin
export const deleteAppointmentAdmin = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (appointment.status !== 'Cancelled') {
            await TimeSlot.findOneAndUpdate(
                { hospital: appointment.hospital, date: appointment.date, timeSlot: appointment.timeSlot },
                { $inc: { bookedCount: -1 } }
            );
        }

        // Deleting the document
        await Appointment.findByIdAndDelete(req.params.id);

        res.status(200).json({ success: true, message: 'Appointment permanently deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting appointment' });
    }
};

// @desc    Get dashboard statistics for Admin
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
    try {
        const totalAppointments = await Appointment.countDocuments();

        const statusCounts = await Appointment.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        const totalUsers = await User.countDocuments();

        // Format for recharts
        const chartData = statusCounts.map(item => ({
            name: item._id,
            value: item.count
        }));

        const stats = {
            totalAppointments,
            totalUsers,
            statusCounts: chartData
        };

        res.status(200).json(stats);
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: 'Server error retrieving statistics' });
    }
};

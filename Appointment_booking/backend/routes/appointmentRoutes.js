import express from 'express';
import {
    getAvailableSlots,
    createAppointment,
    getUserAppointments,
    updateAppointmentStatus,
    updateAppointment,
    downloadAppointmentPDF,
    deleteAppointment,
    cancelAppointmentPatient
} from '../controllers/appointmentController.js';

const router = express.Router();

// Get available slots for a given hospital, service, and date
router.get('/slots', getAvailableSlots);

// Create a new appointment
router.post('/', createAppointment);

// Get appointments for a user
router.get('/user/:userId', getUserAppointments);

// Update/Cancel an appointment status
router.put('/:id/status', updateAppointmentStatus);

// Update appointment details
router.put('/:id', updateAppointment);

// Download PDF
router.get('/:id/pdf', downloadAppointmentPDF);

// Delete/Cancel an appointment
router.route('/:id').delete(deleteAppointment);
router.route('/cancel/:id').put(cancelAppointmentPatient);

export default router;

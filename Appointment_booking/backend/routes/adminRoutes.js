import express from 'express';
import { getAdminStats, deleteAppointmentAdmin } from '../controllers/appointmentController.js';
import { getAllUsers, deleteUser, getAllAppointments, updateAppointmentStatusAdmin } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protect and admin middleware to all admin routes
router.use(protect, admin);

// Dashboard Statistics
router.get('/stats', getAdminStats);

// User Management
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

// Appointment Management
router.get('/appointments', getAllAppointments);
router.put('/appointments/:id/status', updateAppointmentStatusAdmin);
router.delete('/appointments/:id', deleteAppointmentAdmin);

export default router;

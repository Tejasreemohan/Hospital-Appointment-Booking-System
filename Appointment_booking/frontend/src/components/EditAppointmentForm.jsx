import React, { useState, useEffect } from 'react';
import {
    User, Stethoscope, CalendarDays, Clock,
    X, Check, AlertCircle, Trash2, Loader2, Save
} from 'lucide-react';

const EditAppointmentForm = ({ appointment, onClose, onUpdateSuccess }) => {
    const appointmentId = appointment?._id;
    const [formData, setFormData] = useState({
        patientName: '',
        date: '',
        timeSlot: '',
        service: ''
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [error, setError] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);

    // Example dummy services for a hospital
    const mockServices = ['Cardiology', 'Neurology', 'General Checkup', 'Dental', 'Orthopedics', 'Pediatrics'];

    useEffect(() => {
        // 1. Initialize form with passed appointment data
        if (appointment) {
            const localUser = JSON.parse(localStorage.getItem('user') || '{}');
            setFormData({
                patientName: appointment.user?.name || appointment.patientName || localUser.name || '',
                date: new Date(appointment.date).toISOString().split('T')[0], // YYYY-MM-DD
                timeSlot: appointment.timeSlot,
                service: appointment.service?.name || appointment.service || '',
                hospital: appointment.hospital?._id || appointment.hospital || ''
            });

            setLoading(false);
        } else {
            setError('Failed to load appointment details');
            setLoading(false);
        }
    }, [appointment]);

    // Fetch hospital services dynamically
    const [hospitalServices, setHospitalServices] = useState([]);
    useEffect(() => {
        if (!formData.hospital) return;
        const fetchHospitalDetails = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/hospitals/${formData.hospital}`);
                if (res.ok) {
                    const data = await res.json();
                    setHospitalServices(data.services.map(s => s.name));
                }
            } catch (err) {
                console.error('Failed to load hospital details', err);
            }
        };
        fetchHospitalDetails();
    }, [formData.hospital]);

    useEffect(() => {
        // 2. Fetch available slots when date changes
        const fetchSlots = async () => {
            if (!formData.date) return;

            try {
                // Fetch real available slots from the backend (capacity checking active)
                const hospitalId = formData.hospital;
                if (!hospitalId) return; // Wait until hospital is set

                const response = await fetch(`http://localhost:5000/api/appointments/slots?hospitalId=${hospitalId}&date=${formData.date}`);

                if (response.ok) {
                    const data = await response.json();
                    setAvailableSlots(data);
                } else {
                    console.error('Failed to load slots');
                }
            } catch (err) {
                console.error('Failed to load slots', err);
            }
        };

        fetchSlots();
    }, [formData.date]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error on input change
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            // 3. Call the PUT endpoint
            const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Include JWT if using auth middleware
                },
                body: JSON.stringify({
                    patientName: formData.patientName, // Often readonly in real apps unless changing dependent
                    date: formData.date,
                    timeSlot: formData.timeSlot,
                    service: formData.service
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update appointment');
            }

            // Success
            setSaving(false);
            if (onUpdateSuccess) onUpdateSuccess(data.appointment);
            if (onClose) onClose();

        } catch (err) {
            setError(err.message);
            setSaving(false);
        }
    };

    const handleCancelAppointment = async () => {
        if (!window.confirm('Are you absolutely sure you want to cancel this appointment? This action cannot be undone.')) {
            return;
        }

        setCancelling(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}`, {
                method: 'DELETE', // Or PUT to /api/appointments/cancel/:id depending on backend
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Include JWT if using auth middleware
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to cancel appointment');
            }

            setCancelling(false);
            if (onUpdateSuccess) onUpdateSuccess(data.appointment);
            if (onClose) onClose();
        } catch (err) {
            setError(err.message);
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 p-8 bg-white rounded-3xl shadow-2xl border border-gray-100">
                <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-500 font-bold animate-pulse text-sm">Loading details...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden transform transition-all">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-5 flex justify-between items-center shrink-0 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-2 -mr-2 opacity-10">
                    <CalendarDays className="w-24 h-24 text-white" />
                </div>
                <h2 className="text-xl font-black text-white flex items-center relative z-10">
                    <CalendarDays className="w-5 h-5 mr-2" />
                    Modify Appointment
                </h2>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-colors relative z-10 focus:outline-none focus:ring-2 focus:ring-white"
                        aria-label="Close form"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
                <div className="overflow-y-auto flex-grow p-6 sm:p-8 space-y-5">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start text-sm shadow-sm">
                            <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="font-bold text-red-800">{error}</span>
                        </div>
                    )}
                    {/* Patient Name (Readonly to prevent arbitrary reassignment, usually expected in healthcare) */}
                    <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
                            Patient Name
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="patientName"
                                value={formData.patientName}
                                readOnly
                                className="w-full pl-10 pr-3 py-3 border border-gray-200 bg-gray-50 text-gray-700 font-bold rounded-xl focus:outline-none cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Service Selection */}
                    <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
                            Medical Service
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Stethoscope className="h-5 w-5 text-gray-400" />
                            </div>
                            <select
                                name="service"
                                value={formData.service}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 pr-10 py-3 border border-gray-300 text-gray-900 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm appearance-none transition-shadow hover:shadow-md"
                            >
                                <option value="" disabled>Select a service</option>
                                {hospitalServices.map((srv, idx) => (
                                    <option key={idx} value={srv}>{srv}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Date Selection */}
                    <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
                            New Date
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <CalendarDays className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                min={new Date().toISOString().split('T')[0]} // Cannot book past dates
                                required
                                className="w-full pl-10 pr-3 py-3 border border-gray-300 text-gray-900 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-shadow hover:shadow-md"
                            />
                        </div>
                    </div>

                    {/* Time Slot Selection */}
                    <div>
                        <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
                            New Time Slot
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Clock className="h-5 w-5 text-gray-400" />
                            </div>
                            <select
                                name="timeSlot"
                                value={formData.timeSlot}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 pr-10 py-3 border border-gray-300 text-gray-900 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm appearance-none transition-shadow hover:shadow-md"
                            >
                                <option value="" disabled>Select an available time</option>
                                {availableSlots.map((slot, idx) => (
                                    <option
                                        key={idx}
                                        value={slot.timeSlot}
                                        disabled={!slot.available && formData.timeSlot !== slot.timeSlot}
                                    >
                                        {slot.timeSlot} {!slot.available && formData.timeSlot !== slot.timeSlot ? ' (Booked)' : ''}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Actions - Fixed at bottom */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 shrink-0 flex flex-col space-y-3 sm:flex-row sm:space-y-0 gap-3">
                    <button
                        type="submit"
                        disabled={saving || cancelling}
                        className="flex-1 flex justify-center items-center py-3.5 px-4 rounded-xl shadow-md text-sm font-black text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5"
                    >
                        {saving ? (
                            <><Loader2 className="animate-spin w-4 h-4 mr-2" /> Saving...</>
                        ) : (
                            <><Save className="w-4 h-4 mr-2" /> Update Appointment</>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleCancelAppointment}
                        disabled={saving || cancelling}
                        className="sm:w-auto flex justify-center items-center py-3.5 px-5 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors group"
                        title="Cancel Appointment"
                    >
                        {cancelling ? (
                            <Loader2 className="animate-spin w-4 h-4" />
                        ) : (
                            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditAppointmentForm;

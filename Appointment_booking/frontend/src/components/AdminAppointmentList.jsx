import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminAppointmentList = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch all appointments for Admin
        const fetchAllAppointments = async () => {
            try {
                // Mock fetch - replace with real API call
                // const response = await fetch('http://localhost:5000/api/admin/appointments');
                // const data = await response.json();

                const mockData = [
                    {
                        _id: '1',
                        user: { name: 'John Doe', email: 'john@example.com' },
                        hospital: { name: 'City Hospital' },
                        service: { name: 'General Checkup' },
                        date: new Date().toISOString(),
                        timeSlot: '09:00',
                        status: 'Booked'
                    },
                    {
                        _id: '2',
                        user: { name: 'Jane Smith', email: 'jane@example.com' },
                        hospital: { name: 'City Hospital' },
                        service: { name: 'Cardiology' },
                        date: new Date().toISOString(),
                        timeSlot: '10:30',
                        status: 'Cancelled'
                    }
                ];
                setAppointments(mockData);
                setLoading(false);
            } catch (err) {
                setError('Failed to load appointments');
                setLoading(false);
            }
        };

        fetchAllAppointments();
    }, []);

    const handleDeleteClick = (appointmentId) => {
        // Navigate to the dedicated delete page
        navigate(`/admin/delete/${appointmentId}`);
    };

    if (loading) return <div className="p-8 text-center text-gray-600">Loading appointments...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard: Appointments</h1>

            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-400 rounded">
                    {error}
                </div>
            )}

            <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
                <ul className="divide-y divide-gray-200">
                    {appointments.length === 0 ? (
                        <li className="p-4 text-center text-gray-500">No appointments found.</li>
                    ) : (
                        appointments.map((appointment) => (
                            <li key={appointment._id} className="p-4 hover:bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between">
                                <div className="flex flex-col mb-4 sm:mb-0">
                                    <span className="text-lg font-medium text-gray-800">
                                        {appointment.user.name} - {appointment.service.name}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        {new Date(appointment.date).toLocaleDateString()} at {appointment.timeSlot} | {appointment.hospital.name}
                                    </span>
                                    <span className={`text-sm font-semibold mt-1 ${appointment.status === 'Cancelled' ? 'text-red-600' : appointment.status === 'Completed' ? 'text-green-600' : 'text-blue-600'}`}>
                                        Status: {appointment.status}
                                    </span>
                                </div>
                                <div>
                                    <button
                                        onClick={() => handleDeleteClick(appointment._id)}
                                        className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                                    >
                                        Delete Forever
                                    </button>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
};

export default AdminAppointmentList;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EditAppointmentForm from './EditAppointmentForm';
import {
    Calendar, Clock, MapPin, Building, Activity,
    CalendarX, Plus, CheckCircle2, XCircle, AlertCircle, CalendarDays, X, Edit3
} from 'lucide-react';

const AppointmentDashboard = ({ userId = '123' }) => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Edit Modal State
    const [editingAppointmentId, setEditingAppointmentId] = useState(null);
    const [isCancelling, setIsCancelling] = useState(false);

    const fetchAppointments = async () => {
        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const activeUserId = user.id || userId;

            if (!token || activeUserId === '123') {
                setError('Authentication required');
                setLoading(false);
                return;
            }

            const response = await fetch(`http://localhost:5000/api/appointments/user/${activeUserId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAppointments(data);
            } else {
                throw new Error('Failed to load appointments from server');
            }
        } catch (err) {
            setError(err.message);
            // Fallback mock data for demonstration if backend isn't linked yet
            setAppointments([
                {
                    _id: '1',
                    hospital: { name: 'City Hospital', location: { address: '123 Main St, Springfield, IL 62701' } },
                    service: { name: 'Cardiology Checkup' },
                    date: new Date().toISOString(),
                    timeSlot: '09:00',
                    status: 'Booked'
                },
                {
                    _id: '2',
                    hospital: { name: 'MedCare Center', location: { address: '456 Wellness Way, Suite 100' } },
                    service: { name: 'Annual Physical Exam' },
                    date: new Date(Date.now() - 86400000 * 5).toISOString(),
                    timeSlot: '14:30',
                    status: 'Completed'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [userId]);

    const handleCancelClick = async (appointmentId) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

        setIsCancelling(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Refresh list locally
                setAppointments(appointments.map(app =>
                    app._id === appointmentId ? { ...app, status: 'Cancelled' } : app
                ));
            } else {
                const data = await response.json();
                throw new Error(data.message || 'Failed to cancel');
            }
        } catch (err) {
            alert(err.message);
        } finally {
            setIsCancelling(false);
        }
    };

    const handleEditSuccess = (updatedAppointment) => {
        setAppointments(appointments.map(app =>
            app._id === updatedAppointment._id ? updatedAppointment : app
        ));
        setEditingAppointmentId(null);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Booked': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Booked': return <CalendarDays className="w-3.5 h-3.5 mr-1.5" />;
            case 'Completed': return <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />;
            case 'Cancelled': return <XCircle className="w-3.5 h-3.5 mr-1.5" />;
            default: return null;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <div className="flex flex-col items-center">
                    <Activity className="h-12 w-12 text-blue-500 animate-pulse mb-4" />
                    <p className="text-blue-600 font-medium animate-pulse">Loading appointments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Appointments</h1>
                    <p className="text-gray-500 mt-1 font-medium">Manage your upcoming visits and medical history.</p>
                </div>
                <button
                    onClick={() => navigate('/book')}
                    className="group flex items-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-blue-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                    <Plus className="w-5 h-5 mr-1.5 transition-transform group-hover:rotate-90" />
                    Book New Visit
                </button>
            </div>

            {error && (
                <div className="mb-8 bg-red-50 p-4 rounded-xl text-red-700 border border-red-200 flex items-start shadow-sm">
                    <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5 text-red-500" />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            {appointments.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100 max-w-2xl mx-auto mt-12">
                    <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                        <CalendarX className="h-12 w-12 text-blue-400" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl font-extrabold text-gray-900">No appointments yet</h3>
                    <p className="mt-3 text-gray-500 font-medium max-w-sm mx-auto">
                        You haven't scheduled any medical visits. Book your first appointment to prioritize your health.
                    </p>
                    <button
                        onClick={() => navigate('/book')}
                        className="mt-8 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-bold transition-colors"
                    >
                        Schedule an Appointment
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {appointments.map((appointment) => (
                        <div key={appointment._id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col group">
                            <div className="p-6 flex-grow">
                                <div className="flex justify-between items-start mb-5">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${getStatusStyle(appointment.status)}`}>
                                        {getStatusIcon(appointment.status)}
                                        {appointment.status}
                                    </span>
                                </div>

                                <h3 className="text-xl font-extrabold text-gray-900 mb-5 leading-tight group-hover:text-blue-700 transition-colors">
                                    {appointment.service.name}
                                </h3>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center text-gray-700">
                                        <div className="bg-gray-50 p-2 rounded-lg mr-3">
                                            <Calendar className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <div>
                                            <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</span>
                                            <span className="font-bold">
                                                {new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-gray-700">
                                        <div className="bg-gray-50 p-2 rounded-lg mr-3">
                                            <Clock className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <div>
                                            <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Time</span>
                                            <span className="font-bold">{appointment.timeSlot}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-start">
                                    <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100 mr-3 flex-shrink-0">
                                        <Building className="w-5 h-5 text-indigo-500" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{appointment.hospital?.name || 'Hospital Data Unavailable'}</p>
                                        <p className="text-gray-500 text-sm flex items-start mt-1">
                                            <MapPin className="w-4 h-4 mr-1 text-gray-400 flex-shrink-0 mt-0.5" />
                                            <span className="line-clamp-2">{appointment.hospital?.location?.address || 'Location Details'}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {appointment.status === 'Booked' && (
                                <div className="bg-gray-50/80 px-6 py-4 border-t border-gray-100 flex justify-end space-x-3">
                                    <button
                                        onClick={() => setEditingAppointmentId(appointment._id)}
                                        className="flex items-center text-sm font-bold text-slate-700 hover:text-blue-700 transition-colors bg-white border border-slate-200 shadow-sm hover:border-blue-300 hover:bg-blue-50 px-4 py-2 rounded-xl"
                                    >
                                        <Edit3 className="w-4 h-4 mr-1.5" />
                                        Reschedule
                                    </button>
                                    <button
                                        onClick={() => handleCancelClick(appointment._id)}
                                        disabled={isCancelling}
                                        className="flex items-center text-sm font-bold text-red-600 hover:text-red-800 transition-colors bg-red-50 border border-red-100 shadow-sm hover:bg-red-100 px-4 py-2 rounded-xl disabled:opacity-50"
                                    >
                                        <X className="w-4 h-4 mr-1.5" />
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal Overlay */}
            {editingAppointmentId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    {/* Background Overlay */}
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={() => setEditingAppointmentId(null)}></div>

                    {/* Modal Content */}
                    <div className="relative z-10 w-full max-w-2xl bg-transparent rounded-2xl text-left shadow-2xl transform transition-all flex flex-col max-h-full">
                        <EditAppointmentForm
                            appointment={appointments.find(a => a._id === editingAppointmentId)}
                            onClose={() => setEditingAppointmentId(null)}
                            onUpdateSuccess={handleEditSuccess}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentDashboard;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    XCircle, CalendarX, User, Stethoscope,
    CalendarDays, Clock, ArrowLeft, Loader2
} from 'lucide-react';

const CancelAppointment = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        const fetchAppointmentDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await axios.get(`/api/appointments/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                setAppointment(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch appointment details. It may no longer exist.');
            } finally {
                setLoading(false);
            }
        };

        fetchAppointmentDetails();
    }, [id, navigate]);

    const handleCancel = async () => {
        setCancelling(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`/api/appointments/cancel/${id}`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setSuccess('Appointment successfully cancelled! Redirecting to dashboard...');

            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.message || 'Error cancelling the appointment. Please try again.');
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh]">
                <Loader2 className="h-12 w-12 text-red-500 animate-spin mb-4" />
                <p className="text-red-600 font-bold animate-pulse">Loading Appointment Details...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white rounded-3xl shadow-xl border border-red-50 overflow-hidden">
                <div className="bg-gradient-to-r from-red-50 to-orange-50 px-8 py-6 border-b border-red-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-5">
                        <CalendarX className="w-32 h-32 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-black text-red-800 flex items-center relative z-10">
                        <XCircle className="w-8 h-8 mr-3 text-red-500 shadow-sm rounded-full bg-white" />
                        Cancel Appointment
                    </h2>
                </div>

                <div className="p-8 sm:p-10">
                    {success ? (
                        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-6 rounded-xl mb-6 flex items-start">
                            <XCircle className="h-6 w-6 text-emerald-500 mr-3 hidden" />
                            <div className="flex-shrink-0 bg-emerald-100 rounded-full p-1 mr-3">
                                <svg className="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-emerald-800">Cancellation Successful</h3>
                                <p className="text-sm font-medium text-emerald-700 mt-1">{success}</p>
                            </div>
                        </div>
                    ) : error && !appointment ? (
                        <div className="text-center py-12">
                            <CalendarX className="h-16 w-16 text-red-300 mx-auto mb-4" />
                            <p className="text-xl font-bold text-gray-900 mb-2">Record Unavailable</p>
                            <p className="text-red-500 font-medium mb-6">{error}</p>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="inline-flex items-center text-blue-600 font-bold hover:text-blue-800 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" /> Return to Dashboard
                            </button>
                        </div>
                    ) : appointment && (
                        <>
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl mb-8 flex items-start">
                                    <XCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm font-bold text-red-800">{error}</p>
                                </div>
                            )}

                            <p className="text-gray-600 font-medium mb-8 text-lg">
                                Are you sure you want to cancel the following appointment? This action will free up the time slot.
                            </p>

                            <div className="bg-gray-50 rounded-2xl p-6 md:p-8 mb-10 border border-gray-100 shadow-sm relative overflow-hidden">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-8 relative z-10">
                                    <div>
                                        <dt className="text-sm font-bold text-gray-500 mb-1 flex items-center">
                                            <User className="w-4 h-4 mr-1.5 text-gray-400" />
                                            Patient Name
                                        </dt>
                                        <dd className="text-lg font-black text-gray-900 ml-5">{appointment.user?.name || 'Loading...'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-bold text-gray-500 mb-1 flex items-center">
                                            <Stethoscope className="w-4 h-4 mr-1.5 text-gray-400" />
                                            Service Required
                                        </dt>
                                        <dd className="text-lg font-black text-gray-900 ml-5">{appointment.service?.name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-bold text-gray-500 mb-1 flex items-center">
                                            <CalendarDays className="w-4 h-4 mr-1.5 text-gray-400" />
                                            Date
                                        </dt>
                                        <dd className="text-lg font-black text-gray-900 ml-5">
                                            {new Date(appointment.date).toLocaleDateString(undefined, {
                                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                            })}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-bold text-gray-500 mb-2 flex items-center">
                                            <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
                                            Time Slot
                                        </dt>
                                        <dd className="ml-5">
                                            <span className="bg-white border border-gray-200 text-gray-800 font-extrabold px-3 py-1.5 rounded-lg text-sm shadow-sm inline-flex items-center">
                                                {appointment.timeSlot}
                                            </span>
                                        </dd>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 mt-6 border-t border-gray-100">
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    disabled={cancelling}
                                    className="w-full sm:w-auto bg-white py-3 px-8 border border-gray-200 rounded-xl shadow-sm text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                                >
                                    No, Keep It
                                </button>
                                <button
                                    onClick={handleCancel}
                                    disabled={cancelling}
                                    className="w-full sm:w-auto flex items-center justify-center bg-red-600 py-3 px-8 border border-transparent rounded-xl shadow-md shadow-red-500/30 text-sm font-black text-white hover:bg-red-700 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {cancelling ? (
                                        <>
                                            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                                            Cancelling...
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Yes, Cancel Appointment
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CancelAppointment;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Trash2, AlertTriangle, ShieldAlert, CheckCircle2,
    User, Stethoscope, Clock, CalendarDays, ArrowLeft, Loader2
} from 'lucide-react';

const DeleteAppointment = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [showModal, setShowModal] = useState(false);

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
                setError(err.response?.data?.message || 'Failed to fetch appointment details. It may have already been deleted.');
            } finally {
                setLoading(false);
            }
        };

        fetchAppointmentDetails();
    }, [id, navigate]);

    const handleConfirmDelete = async () => {
        setDeleting(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            // Assuming admin token is active
            const response = await axios.delete(`/api/admin/appointments/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setShowModal(false);
            setSuccess('Appointment permanently deleted! Redirecting to admin dashboard...');

            setTimeout(() => {
                navigate('/admin');
            }, 2000);

        } catch (err) {
            setShowModal(false);
            setError(err.response?.data?.message || 'Error deleting the appointment. Please check your admin privileges.');
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh]">
                <Loader2 className="h-12 w-12 text-red-600 animate-spin mb-4" />
                <p className="text-red-600 font-bold animate-pulse">Loading Record Details...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 to-red-800 px-8 py-6 border-b border-red-900">
                    <h2 className="text-2xl font-black text-white flex items-center shadow-sm">
                        <ShieldAlert className="w-8 h-8 mr-3 text-red-100 opacity-90" />
                        Admin: Permanent Deletion
                    </h2>
                </div>

                <div className="p-8 sm:p-10">
                    {success ? (
                        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-6 rounded-xl mb-6 shadow-sm flex items-start">
                            <CheckCircle2 className="h-6 w-6 text-emerald-500 mr-3 flex-shrink-0" />
                            <div>
                                <h3 className="text-lg font-bold text-emerald-800">Success</h3>
                                <p className="text-sm font-medium text-emerald-700 mt-1">{success}</p>
                            </div>
                        </div>
                    ) : error && !appointment ? (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 mb-6 border border-red-100 shadow-inner">
                                <AlertTriangle className="h-10 w-10 text-red-500" />
                            </div>
                            <p className="text-2xl font-black text-gray-900 mb-3">Record Not Found</p>
                            <p className="text-gray-500 font-medium mb-8 max-w-md mx-auto">{error}</p>
                            <button
                                onClick={() => navigate('/admin')}
                                className="inline-flex items-center bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all hover:-translate-y-0.5"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Return to Admin Panel
                            </button>
                        </div>
                    ) : appointment && (
                        <>
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl mb-8 shadow-sm flex items-start">
                                    <AlertTriangle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm font-bold text-red-800">{error}</span>
                                </div>
                            )}

                            <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-8 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 -mt-2 -mr-2 opacity-5">
                                    <AlertTriangle className="w-32 h-32 text-red-600" />
                                </div>
                                <h3 className="text-lg font-black text-red-800 mb-2 flex items-center relative z-10">
                                    <AlertTriangle className="w-5 h-5 mr-2" />
                                    Action Required
                                </h3>
                                <p className="text-red-700 font-medium relative z-10">
                                    You are about to permanently delete this appointment from the database. This action completely removes the record and frees up the time slot capacity.
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-10">
                                <div className="px-6 py-5 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-gray-900">Appointment Details</h3>
                                    <span className="text-xs font-mono font-bold text-gray-400 bg-gray-200 px-2 py-1 rounded">ID: {appointment._id}</span>
                                </div>
                                <div className="px-6 py-2">
                                    <dl className="divide-y divide-gray-100">
                                        <div className="py-5 flex flex-col sm:flex-row sm:items-center">
                                            <dt className="text-sm font-bold text-gray-500 sm:w-1/3 flex items-center">
                                                <User className="w-4 h-4 mr-2 text-gray-400" />
                                                Patient Name
                                            </dt>
                                            <dd className="mt-1 text-base text-gray-900 font-extrabold sm:mt-0 sm:w-2/3">{appointment.user?.name || 'N/A'}</dd>
                                        </div>
                                        <div className="py-5 flex flex-col sm:flex-row sm:items-center">
                                            <dt className="text-sm font-bold text-gray-500 sm:w-1/3 flex items-center">
                                                <Stethoscope className="w-4 h-4 mr-2 text-gray-400" />
                                                Service Required
                                            </dt>
                                            <dd className="mt-1 text-base text-gray-900 font-extrabold sm:mt-0 sm:w-2/3">{appointment.service?.name}</dd>
                                        </div>
                                        <div className="py-5 flex flex-col sm:flex-row sm:items-center">
                                            <dt className="text-sm font-bold text-gray-500 sm:w-1/3 flex items-center">
                                                <AlertTriangle className="w-4 h-4 mr-2 text-gray-400" />
                                                Current Status
                                            </dt>
                                            <dd className="mt-1 sm:mt-0 sm:w-2/3">
                                                <span className={`px-3 py-1 inline-flex text-xs font-black uppercase tracking-wider rounded-full shadow-sm ${appointment.status === 'Cancelled' ? 'bg-red-100 text-red-800 border border-red-200' :
                                                    appointment.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                                                    }`}>
                                                    {appointment.status}
                                                </span>
                                            </dd>
                                        </div>
                                        <div className="py-5 flex flex-col sm:flex-row sm:items-center">
                                            <dt className="text-sm font-bold text-gray-500 sm:w-1/3 flex items-center">
                                                <CalendarDays className="w-4 h-4 mr-2 text-gray-400" />
                                                Scheduled Date
                                            </dt>
                                            <dd className="mt-1 text-base text-gray-900 font-extrabold sm:mt-0 sm:w-2/3">
                                                {new Date(appointment.date).toLocaleDateString()}
                                            </dd>
                                        </div>
                                        <div className="py-5 flex flex-col sm:flex-row sm:items-center">
                                            <dt className="text-sm font-bold text-gray-500 sm:w-1/3 flex items-center">
                                                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                                Time Slot
                                            </dt>
                                            <dd className="mt-1 text-base text-gray-900 font-extrabold sm:mt-0 sm:w-2/3">{appointment.timeSlot}</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 mt-6 border-t border-gray-100">
                                <button
                                    onClick={() => navigate('/admin')}
                                    disabled={deleting}
                                    className="w-full sm:w-auto bg-white py-3 px-8 rounded-xl shadow-sm border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => setShowModal(true)}
                                    disabled={deleting}
                                    className="w-full sm:w-auto inline-flex justify-center items-center bg-red-600 py-3 px-8 border border-transparent rounded-xl shadow-lg text-sm font-black text-white hover:bg-red-700 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Record
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={() => !deleting && setShowModal(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        {/* Modal Panel */}
                        <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-100">
                            <div className="bg-white px-6 pt-8 pb-6 sm:p-8 sm:pb-6">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-red-50 sm:mx-0 sm:h-12 sm:w-12 border border-red-100 shadow-inner">
                                        <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                                    </div>
                                    <div className="mt-4 text-center sm:mt-0 sm:ml-6 sm:text-left">
                                        <h3 className="text-xl font-black text-gray-900" id="modal-title">
                                            Confirm Permanent Deletion
                                        </h3>
                                        <div className="mt-3">
                                            <p className="text-sm text-gray-500 font-medium">
                                                Are you absolutely sure you want to permanently delete this appointment for <strong className="text-gray-900">{appointment?.user?.name || 'this patient'}</strong>? All of this data will be destroyed. This action cannot be undone.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-6 py-4 sm:px-8 sm:flex sm:flex-row-reverse border-t border-gray-100 gap-3">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center items-center rounded-xl border border-transparent shadow-md px-6 py-3 bg-red-600 text-base font-black text-white hover:bg-red-700 sm:w-auto sm:text-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                    onClick={handleConfirmDelete}
                                    disabled={deleting}
                                >
                                    {deleting ? (
                                        <><Loader2 className="animate-spin w-4 h-4 mr-2" /> Deleting...</>
                                    ) : 'Yes, Delete Permanently'}
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-200 shadow-sm px-6 py-3 bg-white text-base font-bold text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
                                    onClick={() => setShowModal(false)}
                                    disabled={deleting}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeleteAppointment;

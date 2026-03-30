import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Activity, Filter, CalendarDays, MapPin,
    CheckCircle2, XCircle, Clock, Search, ListFilter, Download
} from 'lucide-react';

const AppointmentStatus = () => {
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const token = localStorage.getItem('token');
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const activeUserId = user._id || user.id;

                if (!token || !activeUserId) {
                    navigate('/login');
                    return;
                }

                // Fetch real data from backend
                const response = await axios.get(`/api/appointments/user/${activeUserId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                setAppointments(response.data);
                setFilteredAppointments(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch appointments.');
            } finally {
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [navigate]);

    useEffect(() => {
        if (filterStatus === 'All') {
            setFilteredAppointments(appointments);
        } else {
            setFilteredAppointments(appointments.filter(app => app.status === filterStatus));
        }
    }, [filterStatus, appointments]);

    const handleDownloadPDF = async (appointmentId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/appointments/${appointmentId}/pdf`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                alert('Failed to generate PDF. Please try again later.');
                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Appointment_${appointmentId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('An error occurred while downloading the PDF.');
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Booked':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Completed':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'Cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Booked':
                return <Clock className="w-3.5 h-3.5 mr-1.5" />;
            case 'Completed':
                return <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />;
            case 'Cancelled':
                return <XCircle className="w-3.5 h-3.5 mr-1.5" />;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh]">
                <Activity className="h-12 w-12 text-blue-500 animate-pulse mb-4" />
                <p className="text-blue-600 font-bold animate-pulse">Loading Your Status...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center">
                        <Activity className="w-8 h-8 mr-3 text-blue-600 shadow-sm rounded-full bg-blue-50 p-1" />
                        Status Tracking
                    </h1>
                    <p className="mt-2 text-gray-500 font-medium">Filter and track the progress of your scheduled visits.</p>
                </div>

                <div className="flex items-center bg-white p-1.5 rounded-2xl shadow-md border border-gray-100 w-full md:w-auto">
                    <div className="hidden sm:flex items-center px-4 text-gray-400">
                        <ListFilter className="w-4 h-4 mr-2" />
                        <span className="text-sm font-bold">Filter:</span>
                    </div>
                    {['All', 'Booked', 'Completed', 'Cancelled'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`flex-1 md:flex-none px-4 py-2.5 text-sm font-extrabold rounded-xl transition-all ${filterStatus === status
                                ? 'bg-blue-600 text-white shadow-md transform scale-105'
                                : 'bg-transparent text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl mb-8 flex items-start shadow-sm">
                    <XCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
                    <p className="text-sm font-bold text-red-700">{error}</p>
                </div>
            )}

            {filteredAppointments.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-16 text-center">
                    <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-blue-50 mb-6 border-8 border-white shadow-sm">
                        <Search className="h-10 w-10 text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">No Records Found</h3>
                    <p className="text-gray-500 font-medium max-w-sm mx-auto">
                        {filterStatus === 'All'
                            ? "You don't have any appointments on record yet. Head to the dashboard to book one."
                            : `You don't have any appointments with the status '${filterStatus}'.`}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredAppointments.map((appointment) => (
                        <div key={appointment._id} className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col group hover:-translate-y-1">
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm ${getStatusStyles(appointment.status)}`}>
                                        {getStatusIcon(appointment.status)}
                                        {appointment.status}
                                    </span>
                                    <p className="flex items-center text-sm font-extrabold text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                        <CalendarDays className="w-4 h-4 mr-1.5 text-blue-500" />
                                        {new Date(appointment.date).toLocaleDateString(undefined, {
                                            month: 'short', day: 'numeric', year: 'numeric'
                                        })}
                                    </p>
                                </div>

                                <h3 className="text-xl font-black text-gray-900 mb-4 line-clamp-2 leading-tight">
                                    {appointment.service?.name || 'General Medical Service'}
                                </h3>

                                <div className="flex items-center text-gray-700 mb-6 text-sm bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <Clock className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" />
                                    <span className="font-extrabold">{appointment.timeSlot}</span>
                                </div>

                                <div className="border-t border-gray-100 pt-6 mt-2 relative">
                                    <div className="absolute top-0 right-0 -mt-3 mr-2 bg-white px-2">
                                        <div className="h-1.5 w-8 bg-gray-200 rounded-full"></div>
                                    </div>
                                    <div className="flex items-start">
                                        <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-black text-gray-900 group-hover:text-blue-700 transition-colors">
                                                {appointment.hospital?.name || 'Unknown Location'}
                                            </p>
                                            <p className="text-xs font-mono font-bold text-gray-400 mt-1.5 truncate">
                                                REF: {appointment._id.substring(0, 8).toUpperCase()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDownloadPDF(appointment._id)}
                                    className="mt-6 w-full flex justify-center items-center py-2.5 px-4 border border-emerald-200 rounded-xl text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download PDF
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AppointmentStatus;

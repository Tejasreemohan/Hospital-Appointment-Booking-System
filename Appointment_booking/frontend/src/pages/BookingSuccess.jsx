import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
    CheckCircle2, Download, FileText, CalendarDays,
    Clock, MapPin, Activity, ArrowRight, ShieldCheck
} from 'lucide-react';

const BookingSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState(5);

    // We expect the booking details to be passed via React Router state
    const appointmentDetails = location.state?.appointment;

    useEffect(() => {
        // If someone hits this page directly without booking data, kick them out
        if (!appointmentDetails) {
            navigate('/dashboard', { replace: true });
            return;
        }

        // Countdown timer
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/dashboard');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [appointmentDetails, navigate]);

    if (!appointmentDetails) return null;

    const handleDownloadPDF = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/appointments/${appointmentDetails._id}/pdf`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                alert('Failed to generate PDF. Please try again later.');
                return;
            }

            // Create a blob from the PDF stream
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Appointment_${appointmentDetails._id}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('An error occurred while downloading the PDF.');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-emerald-50 relative overflow-hidden group">

                {/* Decorative background accent */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-b-[40%] transform -translate-y-8 transition-transform duration-700 ease-out group-hover:-translate-y-6"></div>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-white shadow-xl mb-6 border-4 border-emerald-100 flex-shrink-0 relative">
                        <CheckCircle2 className="h-12 w-12 text-emerald-500 flex-shrink-0 animate-bounce drop-shadow-md" />
                        <div className="absolute -right-2 -bottom-2 bg-emerald-100 rounded-full p-1 border border-white">
                            <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-black text-gray-900 mb-2 mt-2 tracking-tight">Booking Confirmed!</h2>
                    <p className="text-gray-500 mb-8 font-medium">Your appointment has been successfully scheduled.</p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100 shadow-inner relative z-10">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-200 pb-2 flex items-center">
                        <Activity className="w-4 h-4 mr-2" />
                        Appointment Details
                    </h3>
                    <dl className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                            <dt className="text-sm font-bold text-gray-500 flex items-center mb-1 sm:mb-0">
                                <FileText className="w-4 h-4 mr-2 text-gray-400" /> Service
                            </dt>
                            <dd className="text-sm font-black text-gray-900">{appointmentDetails?.service?.name || appointmentDetails?.service || 'Medical Service'}</dd>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                            <dt className="text-sm font-bold text-gray-500 flex items-center mb-1 sm:mb-0">
                                <CalendarDays className="w-4 h-4 mr-2 text-gray-400" /> Date
                            </dt>
                            <dd className="text-sm font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                                {appointmentDetails?.date ? new Date(appointmentDetails.date).toLocaleDateString(undefined, {
                                    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                                }) : 'TBD'}
                            </dd>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                            <dt className="text-sm font-bold text-gray-500 flex items-center mb-1 sm:mb-0">
                                <Clock className="w-4 h-4 mr-2 text-gray-400" /> Time Segment
                            </dt>
                            <dd className="text-sm font-black text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">{appointmentDetails?.timeSlot}</dd>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                            <dt className="text-sm font-bold text-gray-500 flex items-center mb-1 sm:mb-0">
                                <MapPin className="w-4 h-4 mr-2 text-gray-400" /> Location
                            </dt>
                            <dd className="text-sm font-bold text-gray-900 truncate max-w-[200px] text-left sm:text-right hover:text-blue-600 transition-colors cursor-default" title={appointmentDetails?.hospital?.name || appointmentDetails?.hospital}>
                                {appointmentDetails?.hospital?.name || appointmentDetails?.hospital || 'Hospital Campus'}
                            </dd>
                        </div>
                        <div className="flex justify-between items-center sm:flex-col sm:items-start md:flex-row md:items-center mt-4 pt-4 border-t border-gray-200">
                            <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider">Booking ID</dt>
                            <dd className="text-xs font-mono font-bold text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">{appointmentDetails?._id}</dd>
                        </div>
                    </dl>
                </div>

                <div className="space-y-4 relative z-10 mt-6 flex flex-col items-stretch">
                    <button
                        onClick={handleDownloadPDF}
                        className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-emerald-500/30 text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all hover:-translate-y-0.5 group/btn"
                    >
                        <Download className="w-5 h-5 mr-2 group-hover/btn:-translate-y-1 transition-transform" />
                        Download PDF Receipt
                    </button>

                    <Link
                        to="/dashboard"
                        className="w-full flex justify-center items-center py-4 px-4 border border-gray-200 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all hover:border-gray-300 group/link"
                    >
                        Go to Dashboard Now
                        <ArrowRight className="w-4 h-4 ml-2 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="text-center mt-8 relative z-10 border-t border-gray-100 pt-6">
                    <p className="text-sm text-gray-500 font-medium flex justify-center items-center">
                        <Loader2 className="animate-spin w-4 h-4 mr-2 text-blue-500" />
                        Redirecting to Dashboard in <span className="font-black text-blue-600 ml-1.5 text-base">{timeLeft}</span>s...
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BookingSuccess;

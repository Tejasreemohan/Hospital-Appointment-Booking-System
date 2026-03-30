import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Calendar as CalendarIcon, MapPin, Building2, Stethoscope,
    CheckCircle2, AlertCircle, Loader2, Info, Clock, ArrowRight
} from 'lucide-react';

const SlotBooking = () => {
    const navigate = useNavigate();

    // Form state
    const [selectedDate, setSelectedDate] = useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    });

    const [selectedSlot, setSelectedSlot] = useState('');
    const [selectedService, setSelectedService] = useState('');
    const [selectedHospital, setSelectedHospital] = useState('');

    // Data state
    const [slots, setSlots] = useState([]);
    const [hospitals, setHospitals] = useState([]);
    const [services, setServices] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    // UI state
    const [booking, setBooking] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const maxCapacity = 10;

    useEffect(() => {
        // Authenticate
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        // Fetch real hospitals from the API
        const fetchHospitals = async () => {
            try {
                const response = await axios.get('/api/hospitals');
                setHospitals(response.data);
                if (response.data.length > 0) {
                    setSelectedHospital(response.data[0]._id);
                    setServices(response.data[0].services || []);
                    if (response.data[0].services?.length > 0) {
                        setSelectedService(response.data[0].services[0].name);
                    }
                }
            } catch (err) {
                console.error("Failed to load hospitals", err);
            }
        };

        fetchHospitals();
    }, [navigate]);

    useEffect(() => {
        const hospital = hospitals.find(h => h._id === selectedHospital);
        if (hospital && hospital.services) {
            setServices(hospital.services);
            if (hospital.services.length > 0) {
                setSelectedService(hospital.services[0].name);
            } else {
                setSelectedService('');
            }
        }
    }, [selectedHospital, hospitals]);

    const fetchSlots = async () => {
        if (!selectedDate || !selectedHospital) return;

        setLoadingSlots(true);
        setError('');

        try {
            // Using the existing backend endpoint
            const response = await axios.get(`/api/appointments/slots?hospitalId=${selectedHospital}&date=${selectedDate}`);
            setSlots(response.data);
            setSelectedSlot(''); // Reset selection when slots reload
        } catch (err) {
            setError('Failed to load available time slots. Please try again later.');
            setSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };

    // Fetch slots whenever date or hospital changes
    useEffect(() => {
        fetchSlots();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate, selectedHospital]);

    const handleBookAppointment = async (e) => {
        e.preventDefault();

        if (!selectedSlot) {
            setError('Please select a time slot first.');
            return;
        }

        setBooking(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');

            if (!token || !userStr) {
                navigate('/login');
                return;
            }

            const user = JSON.parse(userStr);

            // POST to existing create appointment endpoint
            const response = await axios.post('/api/appointments', {
                user: user._id || user.id,
                hospital: selectedHospital,
                service: { name: selectedService },
                date: selectedDate,
                timeSlot: selectedSlot
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setSuccess('Appointment perfectly booked! Your slot has been reserved.');

            // Real-time UI update: refresh slots immediately to show new capacity
            await fetchSlots();

            // Navigate away to success page securely passing the response data
            setTimeout(() => {
                navigate('/success', { state: { appointment: response.data } });
            }, 1000);

        } catch (err) {
            setError(err.response?.data?.message || 'Error booking appointment. The slot may have filled up.');
        } finally {
            setBooking(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">Book a New Appointment</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Right side: Configuration panel */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                            <Info className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" />
                            Configuration
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                                    <Building2 className="w-4 h-4 mr-1.5 text-gray-400" />
                                    Select Target Hospital
                                </label>
                                <select
                                    value={selectedHospital}
                                    onChange={(e) => setSelectedHospital(e.target.value)}
                                    className="w-full border-gray-200 bg-gray-50 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-3.5 border transition-colors outline-none"
                                >
                                    {hospitals.map(h => (
                                        <option key={h._id} value={h._id}>{h.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                                    <Stethoscope className="w-4 h-4 mr-1.5 text-gray-400" />
                                    Required Service
                                </label>
                                <select
                                    value={selectedService}
                                    onChange={(e) => setSelectedService(e.target.value)}
                                    className="w-full border-gray-200 bg-gray-50 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-3.5 border transition-colors outline-none"
                                >
                                    {services.map(s => (
                                        <option key={s._id} value={s.name}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                                    <CalendarIcon className="w-4 h-4 mr-1.5 text-gray-400" />
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full border-gray-200 bg-gray-50 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-3.5 border transition-colors outline-none cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Left side: Slots panel */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 relative min-h-[450px]">

                        {/* Header Area */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-gray-100 pb-5 gap-4">
                            <div>
                                <h2 className="text-2xl font-extrabold text-gray-900 flex items-center">
                                    <Clock className="w-6 h-6 mr-2 text-blue-600 flex-shrink-0" />
                                    Available Time Slots
                                </h2>
                                <p className="text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-md text-sm mt-2 inline-block">
                                    {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                            <div className="flex items-center space-x-2 bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold border border-gray-200">
                                <Info className="w-4 h-4 text-gray-400" />
                                <span>Max Capacity: {maxCapacity} per slot</span>
                            </div>
                        </div>

                        {/* Alerts */}
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl mb-6 shadow-sm flex items-start">
                                <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700 font-medium">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-xl mb-6 shadow-sm">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-bold text-green-800">{success}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Slot Grid */}
                        {loadingSlots ? (
                            <div className="flex flex-col justify-center items-center py-20">
                                <Loader2 className="animate-spin h-10 w-10 text-blue-600 mb-4" />
                                <p className="text-blue-600 font-medium animate-pulse">Scanning schedule...</p>
                            </div>
                        ) : slots.length === 0 ? (
                            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
                                <p className="text-gray-500 font-medium mb-2">No slots generated for this date.</p>
                                <p className="text-sm text-gray-400">Please select a different date or hospital.</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
                                    {slots.map((slot) => {
                                        const bookedCount = slot.currentBookings || 0;
                                        const isFull = bookedCount >= maxCapacity;
                                        const isSelected = selectedSlot === slot.timeSlot;
                                        const remaining = maxCapacity - bookedCount;

                                        return (
                                            <button
                                                key={slot.timeSlot}
                                                disabled={isFull || booking}
                                                onClick={() => setSelectedSlot(slot.timeSlot)}
                                                className={`
                                                    relative p-4 rounded-2xl border-2 text-left transition-all duration-200 outline-none
                                                    ${isFull
                                                        ? 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed'
                                                        : isSelected
                                                            ? 'border-blue-600 bg-blue-50 shadow-md transform scale-105 z-10'
                                                            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                                                    }
                                                `}
                                            >
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className={`text-lg font-extrabold ${isFull ? 'text-gray-400' : isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                                                        {slot.timeSlot}
                                                    </span>
                                                    {isSelected && (
                                                        <div className="flex-shrink-0 flex items-center justify-center">
                                                            <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="w-full bg-gray-200 rounded-full h-2 mb-2 mt-3 overflow-hidden shadow-inner">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-300 ${isFull ? 'bg-red-500' :
                                                            remaining <= 2 ? 'bg-orange-500' :
                                                                'bg-emerald-500'
                                                            }`}
                                                        style={{ width: `${(bookedCount / maxCapacity) * 100}%` }}
                                                    ></div>
                                                </div>

                                                <p className={`text-xs font-bold ${isFull ? 'text-red-500' :
                                                    remaining <= 2 ? 'text-orange-500' :
                                                        'text-emerald-600'
                                                    }`}>
                                                    {isFull ? 'Fully Booked' : `${remaining} slots left`}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <p className="text-sm font-medium text-gray-500">
                                        {selectedSlot ? (
                                            <>Selected: <strong className="text-blue-700">{selectedSlot}</strong> on {new Date(selectedDate).toLocaleDateString()}</>
                                        ) : (
                                            'Please select an available time period.'
                                        )}
                                    </p>
                                    <button
                                        onClick={handleBookAppointment}
                                        disabled={!selectedSlot || booking}
                                        className={`
                                            w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center
                                            ${!selectedSlot || booking
                                                ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5'
                                            }
                                        `}
                                    >
                                        {booking ? (
                                            <span className="flex items-center">
                                                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                                Reserving Slot...
                                            </span>
                                        ) : (
                                            <>
                                                Confirm Booking
                                                <ArrowRight className="ml-2 w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SlotBooking;

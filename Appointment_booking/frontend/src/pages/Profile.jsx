import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    User, Mail, Shield, Activity, CalendarDays,
    CheckCircle2, XCircle, Clock, Edit3, Save, X, AlertCircle
} from 'lucide-react';

const Profile = () => {
    const navigate = useNavigate();

    // User State
    const [userProfile, setUserProfile] = useState({ name: '', email: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', email: '', password: '' });

    // Appointments State
    const [appointments, setAppointments] = useState([]);
    const [summary, setSummary] = useState({ total: 0, booked: 0, completed: 0, cancelled: 0 });

    // UI State
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = localStorage.getItem('token');
                const userObj = JSON.parse(localStorage.getItem('user') || '{}');
                const userId = userObj._id || userObj.id;

                if (!token || !userId) {
                    navigate('/login');
                    return;
                }

                // Fetch User Details
                const userRes = await axios.get(`/api/users/profile?userId=${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                setUserProfile({ name: userRes.data.name, email: userRes.data.email });
                setEditForm({ name: userRes.data.name, email: userRes.data.email, password: '' });

                // Fetch Appointments to build summary
                const aptRes = await axios.get(`/api/appointments/user/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const apts = aptRes.data || [];
                setAppointments(apts);

                // Calculate summary
                const summaryStats = {
                    total: apts.length,
                    booked: apts.filter(a => a.status === 'Booked').length,
                    completed: apts.filter(a => a.status === 'Completed').length,
                    cancelled: apts.filter(a => a.status === 'Cancelled').length
                };
                setSummary(summaryStats);

            } catch (err) {
                setError('Failed to load profile data.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [navigate]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const userObj = JSON.parse(localStorage.getItem('user') || '{}');

            const updatePayload = {
                userId: userObj._id || userObj.id,
                name: editForm.name,
                email: editForm.email
            };

            // Only send password if user typed a new one
            if (editForm.password) {
                updatePayload.password = editForm.password;
            }

            const response = await axios.put('/api/users/profile', updatePayload, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setUserProfile({ name: response.data.name, email: response.data.email });

            // Update local storage so navbar/other components reflect the change
            const updatedUserObj = { ...userObj, name: response.data.name, email: response.data.email };
            localStorage.setItem('user', JSON.stringify(updatedUserObj));

            setSuccess('Profile successfully updated!');
            setIsEditing(false);
            setEditForm(prev => ({ ...prev, password: '' })); // clear password field

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile details.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh]">
                <Activity className="h-12 w-12 text-blue-500 animate-pulse mb-4" />
                <p className="text-blue-600 font-medium animate-pulse">Loading patient profile...</p>
            </div>
        );
    }

    // Get initials for the avatar placeholder
    const getInitials = (name) => {
        return name
            ? name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)
            : 'U';
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">Patient Profile</h1>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl mb-6 shadow-sm flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="font-medium text-red-700">{error}</span>
                </div>
            )}

            {success && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-xl mb-6 shadow-sm flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="font-bold text-green-800">{success}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Left Column: Personal Info Card */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">
                        {/* Header Background */}
                        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>

                        <div className="px-6 pb-6 sm:px-10 sm:pb-10 relative">
                            {/* Avatar */}
                            <div className="flex justify-between items-end -mt-16 mb-8">
                                <div className="h-32 w-32 rounded-full border-4 border-white bg-blue-100 flex items-center justify-center text-4xl font-extrabold text-blue-700 shadow-md">
                                    {getInitials(userProfile.name)}
                                </div>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center text-sm font-bold text-blue-700 hover:text-blue-900 bg-white shadow-sm border border-gray-200 hover:border-blue-300 hover:bg-blue-50 px-5 py-2.5 rounded-xl transition-all hover:-translate-y-0.5"
                                    >
                                        <Edit3 className="w-4 h-4 mr-2" />
                                        Update Details
                                    </button>
                                )}
                            </div>

                            <div className="mb-4">
                                <h2 className="text-2xl font-extrabold text-gray-900">{userProfile.name}</h2>
                                <p className="text-gray-500 font-medium flex items-center mt-1">
                                    <Mail className="w-4 h-4 mr-1.5" />
                                    {userProfile.email}
                                </p>
                            </div>

                            <div className="mt-8 border-t border-gray-100 pt-8">
                                {isEditing ? (
                                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                            <div>
                                                <label className="flex items-center text-sm font-bold text-gray-700 mb-2">
                                                    <User className="w-4 h-4 mr-1.5 text-gray-400" />
                                                    Full Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editForm.name}
                                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                    required
                                                    className="w-full border-gray-200 bg-gray-50 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border transition-colors outline-none font-medium"
                                                />
                                            </div>
                                            <div>
                                                <label className="flex items-center text-sm font-bold text-gray-700 mb-2">
                                                    <Mail className="w-4 h-4 mr-1.5 text-gray-400" />
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    value={editForm.email}
                                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                    required
                                                    className="w-full border-gray-200 bg-gray-50 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border transition-colors outline-none font-medium"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="flex items-center text-sm font-bold text-gray-700 mb-2">
                                                <Shield className="w-4 h-4 mr-1.5 text-gray-400" />
                                                New Password
                                            </label>
                                            <input
                                                type="password"
                                                value={editForm.password}
                                                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                                placeholder="Leave blank to keep current"
                                                className="w-full md:w-1/2 border-gray-200 bg-gray-50 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border transition-colors outline-none font-medium"
                                            />
                                        </div>

                                        <div className="flex space-x-4 pt-6 mt-4 border-t border-gray-100">
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/30 transition-all disabled:opacity-50 hover:-translate-y-0.5 flex items-center"
                                            >
                                                {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Profile</>}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setEditForm({ name: userProfile.name, email: userProfile.email, password: '' });
                                                }}
                                                disabled={saving}
                                                className="px-6 py-3 rounded-xl text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center"
                                            >
                                                <X className="w-4 h-4 mr-1.5" />
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-8 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                        <div className="sm:col-span-1">
                                            <dt className="text-sm font-bold text-gray-500 mb-1 flex items-center">
                                                <User className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                                                Registered Name
                                            </dt>
                                            <dd className="text-lg font-extrabold text-gray-900 ml-5">{userProfile.name}</dd>
                                        </div>
                                        <div className="sm:col-span-1">
                                            <dt className="text-sm font-bold text-gray-500 mb-1 flex items-center">
                                                <Mail className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                                                Email Address
                                            </dt>
                                            <dd className="text-lg font-extrabold text-gray-900 ml-5">{userProfile.email}</dd>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <dt className="text-sm font-bold text-gray-500 mb-2 flex items-center">
                                                <Shield className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                                                Account Security
                                            </dt>
                                            <dd className="text-sm font-semibold text-gray-800 flex items-center ml-5 bg-white border border-gray-200 inline-flex px-3 py-1.5 rounded-lg">
                                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 shadow-sm"></span>
                                                Password Protected & Secured
                                            </dd>
                                        </div>
                                    </dl>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Appointment Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden sticky top-24">
                        <div className="px-6 py-6 border-b border-gray-100">
                            <h2 className="text-xl font-extrabold text-gray-900 flex items-center">
                                <Activity className="w-5 h-5 mr-2 text-blue-500" />
                                Patient Activity
                            </h2>
                        </div>

                        <div className="p-6">
                            <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl mb-8 border border-blue-100">
                                <span className="block text-5xl font-black text-blue-600 mb-1 drop-shadow-sm">{summary.total}</span>
                                <span className="block text-sm font-bold text-blue-800 uppercase tracking-widest">Total Visits</span>
                            </div>

                            <ul className="space-y-3">
                                <li className="flex justify-between items-center p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 text-blue-500 mr-3" />
                                        <span className="text-sm font-bold text-gray-700">Upcoming</span>
                                    </div>
                                    <span className="text-sm font-extrabold bg-white border border-gray-200 px-3 py-1 rounded-full text-blue-700 shadow-sm">{summary.booked}</span>
                                </li>
                                <li className="flex justify-between items-center p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex items-center">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-3" />
                                        <span className="text-sm font-bold text-gray-700">Completed</span>
                                    </div>
                                    <span className="text-sm font-extrabold bg-white border border-gray-200 px-3 py-1 rounded-full text-emerald-700 shadow-sm">{summary.completed}</span>
                                </li>
                                <li className="flex justify-between items-center p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex items-center">
                                        <XCircle className="w-4 h-4 text-red-500 mr-3" />
                                        <span className="text-sm font-bold text-gray-700">Cancelled</span>
                                    </div>
                                    <span className="text-sm font-extrabold bg-white border border-gray-200 px-3 py-1 rounded-full text-red-700 shadow-sm">{summary.cancelled}</span>
                                </li>
                            </ul>

                            <button
                                onClick={() => navigate('/dashboard')}
                                className="mt-8 w-full flex justify-center items-center px-4 py-3 border border-gray-200 shadow-sm text-sm font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-blue-300 transition-colors"
                            >
                                <CalendarDays className="w-4 h-4 mr-2 text-gray-400" />
                                View Full Schedule
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;

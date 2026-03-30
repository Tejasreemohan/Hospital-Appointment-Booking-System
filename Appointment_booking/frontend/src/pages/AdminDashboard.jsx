import React, { useState, useEffect } from 'react';
import { Activity, Trash2, Edit, CheckCircle, Clock, XCircle, Users, Calendar, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' or 'users'
    const [appointments, setAppointments] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const token = localStorage.getItem('token');

    // Fetch data based on active tab
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                if (activeTab === 'appointments') {
                    const res = await fetch('http://localhost:5000/api/admin/appointments', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!res.ok) throw new Error('Failed to fetch appointments');
                    const data = await res.json();
                    setAppointments(data);
                } else {
                    const res = await fetch('http://localhost:5000/api/admin/users', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!res.ok) throw new Error('Failed to fetch users');
                    const data = await res.json();
                    setUsers(data);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [activeTab, token]);

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const res = await fetch(`http://localhost:5000/api/admin/appointments/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) throw new Error('Failed to update status');

            setAppointments(appointments.map(app =>
                app._id === id ? { ...app, status: newStatus } : app
            ));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteAppointment = async (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this appointment?')) return;

        try {
            const res = await fetch(`http://localhost:5000/api/admin/appointments/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to delete appointment');

            setAppointments(appointments.filter(app => app._id !== id));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteUser = async (id, role) => {
        if (role === 'Admin') {
            alert('Cannot delete an admin account.');
            return;
        }
        if (!window.confirm('Are you sure you want to delete this user and all their appointments? This action cannot be undone.')) return;

        try {
            const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to delete user');
            }

            setUsers(users.filter(u => u._id !== id));
        } catch (err) {
            alert(err.message);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-100 text-emerald-800';
            case 'Booked': return 'bg-blue-100 text-blue-800';
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h1>
                    <p className="text-gray-500 mt-1 font-medium">Manage all platform data and users centrally.</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-4 border-b border-gray-200 mb-8">
                <button
                    onClick={() => setActiveTab('appointments')}
                    className={`pb-4 px-4 font-bold text-sm tracking-wide transition-all ${activeTab === 'appointments' ? 'border-b-4 border-blue-600 text-blue-700' : 'text-gray-500 hover:text-gray-800'}`}
                >
                    <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" /> Appointments
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`pb-4 px-4 font-bold text-sm tracking-wide transition-all ${activeTab === 'users' ? 'border-b-4 border-blue-600 text-blue-700' : 'text-gray-500 hover:text-gray-800'}`}
                >
                    <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" /> Users
                    </div>
                </button>
            </div>

            {error && (
                <div className="mb-8 bg-red-50 p-4 rounded-xl text-red-700 border border-red-200 flex items-start">
                    <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5 text-red-500" />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="flex flex-col items-center">
                        <Activity className="h-10 w-10 text-blue-500 animate-pulse mb-3" />
                        <p className="text-blue-600 font-medium animate-pulse">Loading data...</p>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        {activeTab === 'appointments' ? (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Patient</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Service & Hospital</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {appointments.map((app) => (
                                        <tr key={app._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-bold text-gray-900">{app.user?.name || 'Unknown User'}</div>
                                                <div className="text-sm text-gray-500">{app.user?.email || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-bold text-gray-900">{app.service?.name}</div>
                                                <div className="text-sm text-gray-500">{app.hospital?.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="text-gray-900">{new Date(app.date).toLocaleDateString()}</div>
                                                <div className="text-gray-500">{app.timeSlot}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select
                                                    value={app.status}
                                                    onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                                                    className={`text-xs font-bold rounded-full px-3 py-1 border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer ${getStatusStyle(app.status)}`}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Booked">Booked</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleDeleteAppointment(app._id)}
                                                    className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors inline-block"
                                                    title="Permanently Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {appointments.length === 0 && (
                                        <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-medium">No appointments found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                                        <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">{user.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {user.role !== 'Admin' && (
                                                    <button
                                                        onClick={() => handleDeleteUser(user._id, user.role)}
                                                        className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors inline-block"
                                                        title="Delete User & Appointments"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-medium">No users found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

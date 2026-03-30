import React, { useState, useEffect } from 'react';
import { Activity, Users, Calendar, BarChart2, PieChart, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';

const AdminAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/admin/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!res.ok) {
                    throw new Error('Failed to fetch analytics data');
                }

                const data = await res.json();
                setStats(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [token]);

    const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b'];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">System Analytics</h1>
                <p className="text-gray-500 mt-1 font-medium">Overview of platform usage and appointment statistics.</p>
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
                        <p className="text-blue-600 font-medium animate-pulse">Loading analytics...</p>
                    </div>
                </div>
            ) : stats && (
                <div className="space-y-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex items-center">
                            <div className="bg-blue-50 p-4 rounded-xl mr-5">
                                <Calendar className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold tracking-wider text-gray-400 uppercase">Total Appointments</p>
                                <p className="text-3xl font-extrabold text-gray-900">{stats.totalAppointments}</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex items-center">
                            <div className="bg-indigo-50 p-4 rounded-xl mr-5">
                                <Users className="w-8 h-8 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold tracking-wider text-gray-400 uppercase">Total Registered Users</p>
                                <p className="text-3xl font-extrabold text-gray-900">{stats.totalUsers}</p>
                            </div>
                        </div>
                    </div>

                    {/* Charts Section */}
                    {stats.statusCounts && stats.statusCounts.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                                    <BarChart2 className="w-5 h-5 mr-2 text-blue-500" />
                                    Appointments by Status
                                </h3>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats.statusCounts}>
                                            <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }} />
                                            <YAxis allowDecimals={false} tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }} />
                                            <RechartsTooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                                cursor={{ fill: '#f3f4f6' }}
                                            />
                                            <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                                    <PieChart className="w-5 h-5 mr-2 text-indigo-500" />
                                    Status Distribution
                                </h3>
                                <div className="h-80 w-full flex justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RePieChart>
                                            <Pie
                                                data={stats.statusCounts}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {stats.statusCounts.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                            />
                                        </RePieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                            <p className="text-gray-500 font-medium">No appointment data available to generate charts.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminAnalytics;

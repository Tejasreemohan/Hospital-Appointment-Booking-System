import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, ShieldCheck, Activity, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'Patient' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            setError('Please fill out all fields.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('/api/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role
            });

            setSuccess('Account created! Sending verification code...');

            // Automatically dispatch the OTP via our existing endpoint
            await axios.post('/api/auth/send-otp', { email: formData.email });

            // Short delay to show success message before redirecting to verification screen
            setTimeout(() => {
                navigate('/verify-otp', { state: { email: formData.email } });
            }, 1500);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row-reverse border border-gray-100">

                {/* Right Side - Brand / Info Panel */}
                <div className="md:w-5/12 bg-blue-50 p-10 text-blue-900 flex flex-col justify-between hidden md:flex relative overflow-hidden">
                    <div className="absolute top-0 left-0 -mt-16 -ml-16 text-blue-100 opacity-60">
                        <Activity size={240} strokeWidth={1} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="bg-blue-600 p-2.5 rounded-xl shadow-md">
                                <Activity size={24} className="text-white" strokeWidth={2.5} />
                            </div>
                            <span className="text-2xl font-extrabold tracking-tight text-blue-700">MedCare</span>
                        </div>

                        <h2 className="text-3xl font-bold mb-6 leading-tight">Join Our Healthcare Network.</h2>

                        <div className="space-y-6 mt-8">
                            <div className="flex items-start">
                                <CheckCircle2 className="text-green-500 mt-1 flex-shrink-0" />
                                <div className="ml-3">
                                    <h4 className="font-bold text-gray-900">Easy Appointments</h4>
                                    <p className="text-sm text-gray-600 mt-1">Book and manage slots effortlessly.</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="text-green-500 mt-1 flex-shrink-0" />
                                <div className="ml-3">
                                    <h4 className="font-bold text-gray-900">Secure Records</h4>
                                    <p className="text-sm text-gray-600 mt-1">Your data is safely encrypted.</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle2 className="text-green-500 mt-1 flex-shrink-0" />
                                <div className="ml-3">
                                    <h4 className="font-bold text-gray-900">Real-time Updates</h4>
                                    <p className="text-sm text-gray-600 mt-1">Status tracking for every booking.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Left Side - Form Panel */}
                <div className="w-full md:w-7/12 p-8 sm:p-12 bg-white">
                    <div className="md:hidden flex items-center gap-2 mb-8">
                        <div className="bg-blue-600 p-2 rounded-lg text-white">
                            <Activity size={20} strokeWidth={2.5} />
                        </div>
                        <span className="text-xl font-extrabold text-blue-700">MedCare</span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Create Account</h2>
                        <p className="text-gray-500">
                            Already a member?{' '}
                            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                                Sign in here
                            </Link>
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl mb-6 flex items-start">
                            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div className="ml-3">
                                <p className="text-sm text-red-700 font-medium">{error}</p>
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-xl mb-6 flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <div className="ml-3">
                                <p className="text-sm text-green-700 font-bold">{success}</p>
                            </div>
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSignup}>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <User size={20} />
                                </div>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 bg-gray-50 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all sm:text-sm font-medium"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <Mail size={20} />
                                </div>
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 bg-gray-50 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all sm:text-sm font-medium"
                                    placeholder="you@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 bg-gray-50 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all sm:text-sm font-medium tracking-widest placeholder:tracking-normal"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Confirm</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 bg-gray-50 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all sm:text-sm font-medium tracking-widest placeholder:tracking-normal"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Account Type</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <ShieldCheck size={20} />
                                </div>
                                <select
                                    className="block w-full pl-11 pr-10 py-3.5 border border-gray-200 bg-gray-50 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all sm:text-sm font-bold cursor-pointer hover:bg-white appearance-none"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="Patient">Patient Account</option>
                                    <option value="Hospital">Hospital / Admin</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading || success}
                                className="group relative w-full flex items-center justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-500/30 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Create Account
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signup;

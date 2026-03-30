import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, Activity, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('/api/auth/login', {
                email,
                password
            });

            // Store JWT token locally
            localStorage.setItem('token', response.data.token);

            // Store user info if useful for dashboard
            localStorage.setItem('user', JSON.stringify({
                _id: response.data._id,
                name: response.data.name,
                email: response.data.email,
                role: response.data.role,
                isVerified: response.data.isVerified
            }));

            // Redirect to appropriate dashboard based on role
            if (response.data.role === 'Admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            if (err.response?.status === 403 && err.response?.data?.requiresOtp) {
                // User provided valid credentials but hasn't verified email
                setError('Account unverified. Sending a new OTP to your email...');

                // Fire off the OTP explicitly and redirect them
                try {
                    await axios.post('/api/auth/send-otp', { email });
                    setTimeout(() => {
                        navigate('/verify-otp', { state: { email } });
                    }, 1500);
                } catch (otpErr) {
                    setError('Failed to send verification code. Please try again later.');
                }
            } else {
                setError(err.response?.data?.message || 'Invalid credentials or server error.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100">

                {/* Left Side - Brand / Info Panel */}
                <div className="md:w-5/12 bg-blue-600 p-10 text-white flex flex-col justify-between hidden md:flex relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-16 -mr-16 text-blue-500 opacity-50">
                        <Activity size={240} strokeWidth={1} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                                <Activity size={24} className="text-white" strokeWidth={2.5} />
                            </div>
                            <span className="text-2xl font-extrabold tracking-tight">MedCare</span>
                        </div>

                        <h2 className="text-4xl font-bold mb-6 leading-tight">Your Health,<br />Our Priority.</h2>
                        <p className="text-blue-100 text-lg leading-relaxed mb-8">
                            Sign in to manage your appointments, view medical records, and connect with top healthcare professionals.
                        </p>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center space-x-4 text-blue-200 text-sm font-medium">
                            <span>Secure Checkout</span>
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                            <span>24/7 Support</span>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form Panel */}
                <div className="w-full md:w-7/12 p-8 sm:p-12">
                    <div className="md:hidden flex items-center gap-2 mb-8">
                        <div className="bg-blue-600 p-2 rounded-lg text-white">
                            <Activity size={20} strokeWidth={2.5} />
                        </div>
                        <span className="text-xl font-extrabold text-blue-700">MedCare</span>
                    </div>

                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Welcome Back</h2>
                        <p className="text-gray-500">
                            New to MedCare?{' '}
                            <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                                Create an account
                            </Link>
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl mb-6 flex items-start animate-fade-in-up">
                            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div className="ml-3">
                                <p className="text-sm text-red-700 font-medium">{error}</p>
                            </div>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="email">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                        <Mail size={20} />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 bg-gray-50 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all sm:text-sm font-medium"
                                        placeholder="you@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-bold text-gray-700" htmlFor="password">Password</label>
                                    <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                                        Forgot password?
                                    </a>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 bg-gray-50 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all sm:text-sm font-medium tracking-widest placeholder:tracking-normal"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center mt-6">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer transition-colors"
                            />
                            <label htmlFor="remember-me" className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer">
                                Keep me logged in
                            </label>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex items-center justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-500/30 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        Sign In to MedCare
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

export default Login;


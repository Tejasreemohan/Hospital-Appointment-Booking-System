import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ShieldCheck, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const SendOtp = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [timer, setTimer] = useState(0);

    // Handle countdown timer for resend
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleSendOtp = async (e) => {
        e.preventDefault();

        if (!email) {
            setError('Please enter your email address.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await axios.post('/api/auth/send-otp', { email });
            setSuccess('OTP successfully sent to your email.');
            setTimer(30); // Start 30 second cooldown

            // Automatically redirect to VerifyOtp page passing the email via state.
            setTimeout(() => navigate('/verify-otp', { state: { email } }), 2000);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-gray-100 relative overflow-hidden">

                {/* Decorative background element */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 text-blue-50 opacity-50 pointer-events-none">
                    <ShieldCheck size={200} strokeWidth={1} />
                </div>

                {/* Header section */}
                <div className="text-center relative z-10 mb-8">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-600 shadow-md mb-6 transform -rotate-6">
                        <ShieldCheck className="h-8 w-8 text-white transform rotate-6" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Identity Verification</h2>
                    <p className="mt-3 text-sm text-gray-500 font-medium">We'll send a secure one-time password to your email to confirm it's you.</p>
                </div>

                {/* Alerts */}
                <div className="relative z-10">
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
                                <p className="text-sm text-green-800 font-bold">{success}</p>
                            </div>
                        </div>
                    )}

                    {/* Main Form */}
                    <form className="space-y-6" onSubmit={handleSendOtp}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                                Registered Email
                            </label>
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
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 bg-gray-50 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all sm:text-sm font-medium"
                                    placeholder="you@email.com"
                                    disabled={timer > 0 || loading}
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading || timer > 0}
                                className={`
                                    group relative w-full flex items-center justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white shadow-lg transition-all duration-200
                                    ${loading || timer > 0
                                        ? 'bg-blue-400 cursor-not-allowed shadow-none'
                                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0'
                                    }
                                `}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                                        Sending Code...
                                    </>
                                ) : timer > 0 ? (
                                    `Resend Available in ${timer}s`
                                ) : (
                                    <>
                                        {success ? 'Resend Secure Code' : 'Send Secure Code'}
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-sm font-medium text-gray-500">
                            Remember your credentials?{' '}
                            <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                                Return to Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SendOtp;

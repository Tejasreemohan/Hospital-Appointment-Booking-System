import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const VerifyOtp = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Attempt to get email from navigation state (if redirected from SendOtp)
    const [email, setEmail] = useState(location.state?.email || '');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);

    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Timer for resend
    const [timer, setTimer] = useState(60);

    // Countdown effect
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Format timer to MM:SS
    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Handle individual digit input
    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.nextSibling && element.value !== '') {
            element.nextSibling.focus();
        }
    };

    // Handle backspace
    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && otp[index] === '' && e.target.previousSibling) {
            e.target.previousSibling.focus();
        }
    };

    const handleVerifySubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setError('Missing email address. Please go back and request a new code.');
            return;
        }

        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError('Please enter all 6 digits of your OTP.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await axios.post('/api/auth/verify-otp', {
                email,
                otp: otpString
            });

            setSuccess('Verification successful! Logging you in...');

            // Store auth data just like regular login
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify({
                id: response.data._id,
                name: response.data.name,
                email: response.data.email,
                role: response.data.role
            }));

            // Force hard reload or use a state management trigger in App.jsx
            // For now, redirecting to dashboard will handle it if protected route logic works, 
            // but a window.location might be cleaner to force nav bar re-render
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);

        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!email || timer > 0) return;

        setResendLoading(true);
        setError('');

        try {
            await axios.post('/api/auth/send-otp', { email });
            setSuccess('A new OTP has been sent to your email.');
            setTimer(60); // Reset timer
            setOtp(['', '', '', '', '', '']); // Clear form
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP.');
        } finally {
            setResendLoading(false);
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
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Access Verification</h2>
                    <p className="mt-3 text-sm text-gray-500 font-medium">
                        {email ? (
                            <>Security code sent securely to <span className="font-bold text-gray-800">{email}</span></>
                        ) : (
                            'Please enter the 6-digit code sent to your email account.'
                        )}
                    </p>
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
                    <form className="space-y-8" onSubmit={handleVerifySubmit}>

                        {!email && (
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Registered Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                        <Mail size={20} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 bg-gray-50 text-gray-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all sm:text-sm font-medium"
                                        placeholder="you@email.com"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-4 text-center">Enter 6-Digit Code</label>
                            <div className="flex justify-center gap-2 sm:gap-3">
                                {otp.map((data, index) => {
                                    return (
                                        <input
                                            className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-extrabold rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-gray-50 text-blue-700 transition-all outline-none shadow-sm"
                                            type="text"
                                            name="otp"
                                            maxLength="1"
                                            key={index}
                                            value={data}
                                            onChange={e => handleChange(e.target, index)}
                                            onFocus={e => e.target.select()}
                                            onKeyDown={e => handleKeyDown(e, index)}
                                            disabled={loading}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`
                                    group relative w-full flex items-center justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white shadow-lg transition-all duration-200
                                    ${loading
                                        ? 'bg-blue-400 cursor-not-allowed shadow-none'
                                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0'
                                    }
                                `}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                                        Verifying Identity...
                                    </>
                                ) : (
                                    <>
                                        Authenticate Account
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center justify-center space-y-4">
                        <p className="text-sm text-gray-500 font-medium">
                            Didn't receive the code?
                        </p>

                        <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={timer > 0 || resendLoading}
                            className={`text-sm font-bold flex items-center justify-center w-full py-3 rounded-xl transition-all ${timer > 0
                                ? 'text-gray-400 cursor-not-allowed bg-gray-50 border border-gray-100'
                                : 'text-blue-600 bg-blue-50 border border-blue-100 hover:bg-blue-100'
                                }`}
                        >
                            {resendLoading ? (
                                <><Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" /> Sending...</>
                            ) : timer > 0 ? (
                                `Resend available in ${formatTime(timer)}`
                            ) : (
                                'Resend Security Code'
                            )}
                        </button>

                        <Link to="/send-otp" className="text-xs text-blue-600 hover:text-blue-700 font-semibold hover:underline mt-2">
                            Need to change your email address?
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyOtp;

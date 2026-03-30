import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Activity,
    Calendar,
    Clock,
    User,
    LogOut,
    Menu,
    X,
    ShieldAlert,
    Settings,
    FileText
} from 'lucide-react';

const Navbar = ({ isAuthenticated, isAdmin, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const desktopLinkClass = (path) => `
        flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200
        ${isActive(path)
            ? 'bg-blue-50 text-blue-700 shadow-sm'
            : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
        }
    `;

    const mobileLinkClass = (path) => `
        flex items-center w-full px-4 py-3 rounded-lg text-base font-semibold transition-colors
        ${isActive(path)
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-600 hover:bg-gray-50'
        }
    `;

    return (
        <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo Section */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="bg-blue-600 p-2 rounded-xl text-white group-hover:bg-blue-700 transition-colors shadow-sm">
                                <Activity size={20} strokeWidth={2.5} />
                            </div>
                            <span className="text-xl font-extrabold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
                                MedCare App
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex md:items-center md:space-x-1 lg:space-x-2">
                        {!isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="text-gray-600 hover:text-blue-600 font-semibold px-4 py-2 transition-colors">
                                    Sign In
                                </Link>
                                <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5">
                                    Create Account
                                </Link>
                            </div>
                        ) : (
                            <>
                                <Link to="/book" className={desktopLinkClass('/book')}>
                                    <Calendar size={18} className="mr-2" /> Book Slot
                                </Link>
                                <Link to="/dashboard" className={desktopLinkClass('/dashboard')}>
                                    <FileText size={18} className="mr-2" /> My Appointments
                                </Link>
                                <Link to="/status" className={desktopLinkClass('/status')}>
                                    <Clock size={18} className="mr-2" /> Tracker
                                </Link>
                                <Link to="/profile" className={desktopLinkClass('/profile')}>
                                    <User size={18} className="mr-2" /> Profile
                                </Link>
                                {isAdmin && (
                                    <div className="flex items-center space-x-1 pl-4 ml-4 border-l border-gray-200">
                                        <Link to="/admin" className={desktopLinkClass('/admin')}>
                                            <ShieldAlert size={18} className="mr-2" /> Manage
                                        </Link>
                                        <Link to="/admin/analytics" className={desktopLinkClass('/admin/analytics')}>
                                            <Settings size={18} className="mr-2" /> Analytics
                                        </Link>
                                    </div>
                                )}
                                <div className="pl-4 ml-2 border-l border-gray-200">
                                    <button
                                        onClick={onLogout}
                                        className="flex items-center text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                                    >
                                        <LogOut size={18} className="mr-2" /> Logout
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-500 hover:text-gray-700 focus:outline-none p-2 rounded-md hover:bg-gray-100 transition-colors"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Panel */}
            {isOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white">
                    <div className="px-4 pt-2 pb-6 space-y-1 shadow-inner">
                        {!isAuthenticated ? (
                            <div className="flex flex-col space-y-3 mt-4">
                                <Link
                                    to="/login"
                                    className="w-full text-center text-gray-700 bg-gray-50 font-bold py-3 rounded-xl border border-gray-200"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/signup"
                                    className="w-full text-center text-white bg-blue-600 font-bold py-3 rounded-xl shadow-md shadow-blue-500/20"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Create Account
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-2 mt-2">
                                <Link to="/book" className={mobileLinkClass('/book')} onClick={() => setIsOpen(false)}>
                                    <div className="w-8 flex justify-center"><Calendar size={20} /></div> Book Slot
                                </Link>
                                <Link to="/dashboard" className={mobileLinkClass('/dashboard')} onClick={() => setIsOpen(false)}>
                                    <div className="w-8 flex justify-center"><FileText size={20} /></div> My Appointments
                                </Link>
                                <Link to="/status" className={mobileLinkClass('/status')} onClick={() => setIsOpen(false)}>
                                    <div className="w-8 flex justify-center"><Clock size={20} /></div> Tracker
                                </Link>
                                <Link to="/profile" className={mobileLinkClass('/profile')} onClick={() => setIsOpen(false)}>
                                    <div className="w-8 flex justify-center"><User size={20} /></div> Profile
                                </Link>

                                {isAdmin && (
                                    <div className="pt-4 mt-2 border-t border-gray-100 space-y-2">
                                        <p className="px-4 text-xs font-bold tracking-wider text-gray-400 uppercase">Admin Access</p>
                                        <Link to="/admin" className={mobileLinkClass('/admin')} onClick={() => setIsOpen(false)}>
                                            <div className="w-8 flex justify-center"><ShieldAlert size={20} /></div> Manage Records
                                        </Link>
                                        <Link to="/admin/analytics" className={mobileLinkClass('/admin/analytics')} onClick={() => setIsOpen(false)}>
                                            <div className="w-8 flex justify-center"><Settings size={20} /></div> System Analytics
                                        </Link>
                                    </div>
                                )}

                                <div className="pt-4 mt-2 border-t border-gray-100">
                                    <button
                                        onClick={() => { onLogout(); setIsOpen(false); }}
                                        className="w-full flex items-center px-4 py-3 rounded-lg text-base font-bold text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <div className="w-8 flex justify-center"><LogOut size={20} /></div> Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;

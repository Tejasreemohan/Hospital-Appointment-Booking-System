import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import sendEmail from '../utils/emailService.js';

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    const { name, password, role } = req.body;
    const email = req.body.email?.trim();

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please include all fields' });
    }

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'Patient',
            isVerified: false // Explicitly set to false, requiring OTP
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    const { password } = req.body;
    const email = req.body.email?.trim();

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user || !user.password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Enforce OTP verification
        if (!user.isVerified) {
            return res.status(403).json({ message: 'Please verify your email via OTP to login', requiresOtp: true });
        }

        res.status(200).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// @desc    Send OTP to user email
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOtp = async (req, res) => {
    const { name } = req.body;
    const email = req.body.email?.trim();

    if (!email) {
        return res.status(400).json({ message: 'Please provide an email' });
    }

    try {
        let user = await User.findOne({ email });

        if (!user) {
            // Create user if they don't exist
            user = await User.create({
                name: name || email.split('@')[0],
                email,
            });
        }

        // Generate OTP and set expiration (5 minutes)
        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = Date.now() + 5 * 60 * 1000;
        await user.save();

        // Send email
        const message = `Your confirmation code is: ${otp}.\nThis code expires in 5 minutes.`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Hospital Booking Login OTP',
                message,
            });

            // Output for testing locally since real email might not be configured
            console.log(`[SUCCESS] Email sent to ${user.email} with OTP ${otp}. (Also logging here for dev)`);

            res.status(200).json({ success: true, message: 'OTP sent to email' });
        } catch (error) {
            console.error("Email send error:", error);
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();

            // Return a 200 with the OTP logged to console in dev mode, if email fails 
            console.log(`[DEV FALLBACK] OTP for ${email} is ${otp}`);
            return res.status(200).json({
                success: true,
                message: 'Email service not configured, but OTP generated (check console)'
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Verify OTP and return token
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req, res) => {
    const { otp } = req.body;
    const email = req.body.email?.trim();

    if (!email || !otp) {
        return res.status(400).json({ message: 'Please provide email and OTP' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if OTP matches and is not expired
        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // OTP is valid, mark as verified and clear OTP fields
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
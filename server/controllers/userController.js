import User from "../models/User.js";
import Car from "../models/Car.js";
import { asyncHandler, sendResponse } from "../utils/apiResponse.js";
import logger from "../configs/logger.js";

// Register User
export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return sendResponse.badRequest(res, 'User with this email already exists');
    }

    // Create new user
    const user = await User.create({
        name: name.trim(),
        email: email.toLowerCase(),
        password,
        role: role || 'user'
    });

    // Generate token
    const token = user.generateAuthToken();

    // Update last login
    await user.updateLastLogin();

    logger.info(`New user registered: ${user.email}`);

    sendResponse.created(res, {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image
        },
        token
    }, 'User registered successfully');
});

// Login User 
export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user and include password for verification
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive) {
        return sendResponse.unauthorized(res, 'Invalid email or password');
    }

    // Check password
    const isPasswordValid = await user.isPasswordMatch(password);
    if (!isPasswordValid) {
        return sendResponse.unauthorized(res, 'Invalid email or password');
    }

    // Generate token
    const token = user.generateAuthToken();

    // Update last login
    await user.updateLastLogin();

    logger.info(`User logged in: ${user.email}`);

    sendResponse.success(res, {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image
        },
        token
    }, 'Login successful');
});

// Get User data using Token (JWT)
export const getUserData = asyncHandler(async (req, res) => {
    const { user } = req;
    
    sendResponse.success(res, {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image,
            lastLogin: user.lastLogin
        }
    }, 'User data retrieved successfully');
});

// Get All Cars for the Frontend
export const getCars = asyncHandler(async (req, res) => {
    const cars = await Car.find({ isAvailable: true })
        .populate('owner', 'name email')
        .sort({ createdAt: -1 });
    
    sendResponse.success(res, { cars }, 'Cars retrieved successfully');
});
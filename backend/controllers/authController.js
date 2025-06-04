const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const { USER_PROFILE_TYPES, JWT_SECRET_KEY, MIN_PASSWORD_LENGTH } = require('../config/constants');

// --- Configuration ---
// const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-and-long-key'; // Now from constants.js
const BCRYPT_SALT_ROUNDS = 10; // This can also be moved to constants.js if used elsewhere
// const MIN_PASSWORD_LENGTH = 8; // Now from constants.js

// --- Mock Database ---
// In a real application, this would interact with a PostgreSQL database.
// For now, we'll use an in-memory array to store users.
const mockUsersDb = [];
let userIdCounter = 1;

// --- Controller Functions ---

/**
 * Registers a new user.
 * POST /auth/register
 * Request body: { email, password, profile_type }
 */
exports.register = async (req, res) => {
    try {
        const { email, password, profile_type } = req.body;

        // 1. Validate input
        if (!email || !password || !profile_type) {
            return res.status(400).json({ message: 'Email, password, and profile_type are required.' });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format.' });
        }

        if (password.length < MIN_PASSWORD_LENGTH) {
            return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.` });
        }

        // const allowedProfileTypes = ['freelance', 'accountant', 'sme', 'large_enterprise']; // Now USER_PROFILE_TYPES from constants
        if (!USER_PROFILE_TYPES.includes(profile_type)) {
            return res.status(400).json({ message: `Invalid profile_type. Must be one of: ${USER_PROFILE_TYPES.join(', ')}` });
        }

        // 2. Check if email already exists (mocked)
        if (mockUsersDb.find(user => user.email === email)) {
            return res.status(409).json({ message: 'Email already exists.' });
        }

        // 3. Hash the password
        const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

        // 4. Create new user (mocked)
        const newUser = {
            id: userIdCounter++,
            email,
            passwordHash, // In a real db, this would be 'password_hash'
            profileType: profile_type, // In a real db, this would be 'profile_type'
            createdAt: new Date(), // In a real db, this would be 'created_at'
            updatedAt: new Date()  // In a real db, this would be 'updated_at'
        };
        mockUsersDb.push(newUser);

        // 5. Return success response (excluding password)
        // In a real app, you might return the full user object or just a success message.
        const userToReturn = { ...newUser };
        delete userToReturn.passwordHash; // Never return the password hash

        res.status(201).json({ message: 'User registered successfully.', user: userToReturn });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error during registration.' });
    }
};

/**
 * Logs in an existing user.
 * POST /auth/login
 * Request body: { email, password }
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format.' });
        }

        // 2. Find user by email (mocked)
        const user = mockUsersDb.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' }); // Generic message for security
        }

        // 3. Compare password with stored hash
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' }); // Generic message
        }

        // 4. Generate JWT
        const tokenPayload = {
            userId: user.id,
            profileType: user.profileType // Using profileType as stored in mock DB
        };
        const token = jwt.sign(tokenPayload, JWT_SECRET_KEY, { expiresIn: '1h' }); // Token expires in 1 hour

        // 5. Return JWT
        res.status(200).json({ message: 'Login successful.', token });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error during login.' });
    }
};

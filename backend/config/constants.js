// Allowed VAT rates for invoices
// Stored as decimal values (e.g., 0.05 for 5%)
const ALLOWED_VAT_RATES = [
    0,      // 0%
    0.05,   // 5%
    0.055,  // 5.5%
    0.10,   // 10%
    0.20,   // 20%
    0.30    // 30%
];

// Profile types (already used in authController and authMiddleware, good to centralize)
const USER_PROFILE_TYPES = [
    'freelance',
    'accountant',
    'sme',
    'large_enterprise'
];

// JWT Secret Key - Fallback if not in environment variables
// IMPORTANT: In a production environment, always use environment variables for secrets.
const JWT_SECRET_KEY = process.env.JWT_SECRET || 'your-super-secret-and-long-key';

// Minimum password length (already used in authController, good to centralize)
const MIN_PASSWORD_LENGTH = 8;


module.exports = {
    ALLOWED_VAT_RATES,
    USER_PROFILE_TYPES,
    JWT_SECRET_KEY,
    MIN_PASSWORD_LENGTH
};

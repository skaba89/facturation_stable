const express = require('express');
const router = express.Router();
const { ALLOWED_VAT_RATES } = require('../config/constants');
const { checkRole } = require('../middleware/authMiddleware'); // Optional: protect this route if needed
const { USER_PROFILE_TYPES } = require('../config/constants'); // For checkRole

// GET /api/utils/vat-options - Get allowed VAT rates
// This endpoint can be open or protected based on requirements.
// For now, let's make it accessible to any authenticated user.
router.get('/vat-options', checkRole(USER_PROFILE_TYPES), (req, res) => {
    try {
        // Optionally format for display, e.g., as percentages
        const vatOptionsForDisplay = ALLOWED_VAT_RATES.map(rate => ({
            value: rate, // The actual decimal value
            label: `${rate * 100}%` // A user-friendly label
        }));
        res.json(vatOptionsForDisplay);
    } catch (error) {
        console.error("Error fetching VAT options:", error);
        res.status(500).json({ message: "Error fetching VAT options." });
    }
});

module.exports = router;

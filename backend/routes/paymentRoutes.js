const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { checkRole } = require('../middleware/authMiddleware');
const { USER_PROFILE_TYPES } = require('../config/constants'); // To allow all authenticated users

// Protect all payment routes - user must be authenticated.
// Using USER_PROFILE_TYPES means any authenticated user with a valid profile can access.
router.use(checkRole(USER_PROFILE_TYPES));

// POST /api/payments/initiate - Initiate a new payment for an invoice
router.post('/initiate', paymentController.initiatePayment);

// GET /api/payments/:paymentId/status - Check the status of a payment
router.get('/:paymentId/status', paymentController.checkPaymentStatus);

module.exports = router;

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController'); // Placeholder controller
// const { verifyToken } = require('../middleware/authMiddleware'); // If needed for some routes

// Helper to call controller methods or respond with 501 Not Implemented
const handlePaymentResponse = (controllerMethodName, req, res) => {
    if (paymentController && typeof paymentController[controllerMethodName] === 'function') {
        return paymentController[controllerMethodName](req, res);
    }
    res.status(501).json({ message: `Payment controller method ${controllerMethodName} not implemented.` });
};

// POST /api/webhooks/orangemoney/senegal/notification - Orange Money Webhook
// This route is called by an external service (Orange Money) and should not have user auth middleware.
router.post('/orangemoney/senegal/notification', (req, res) => handlePaymentResponse('orangeMoneyNotificationWebhook', req, res));

// GET /api/webhooks/payments/orangemoney/status/:transactionId - Example status check route
// This was previously in a conceptual `paymentRoutes` object as `/api/payments/...`
// Adjusting path to fit under `/api/webhooks` for this router, or it could be a separate router.
// For simplicity, placing it here. It might need auth.
// router.get('/payments/orangemoney/status/:transactionId', verifyToken, (req, res) => handlePaymentResponse('checkPaymentStatus', req, res));
router.get('/payments/orangemoney/status/:transactionId', (req, res) => handlePaymentResponse('checkPaymentStatus', req, res));


module.exports = router;

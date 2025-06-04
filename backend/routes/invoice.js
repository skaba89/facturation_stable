const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController'); // Placeholder controller
const paymentController = require('../controllers/paymentController'); // For the /pay route
// const { verifyToken } = require('../middleware/authMiddleware'); // Placeholder middleware

// Apply verifyToken middleware to all invoice routes (conceptual)
// router.use(verifyToken);
// For placeholder, we'll assume req.user might be attached by a mock in controller or service for now.

// Helper to call controller methods or respond with 501 Not Implemented
const handleInvoiceResponse = (controllerMethodName, req, res) => {
    if (invoiceController && typeof invoiceController[controllerMethodName] === 'function') {
        return invoiceController[controllerMethodName](req, res);
    }
    res.status(501).json({ message: `Invoice controller method ${controllerMethodName} not implemented.` });
};

const handlePaymentResponse = (controllerMethodName, req, res) => {
    if (paymentController && typeof paymentController[controllerMethodName] === 'function') {
        return paymentController[controllerMethodName](req, res);
    }
    res.status(501).json({ message: `Payment controller method ${controllerMethodName} not implemented.` });
};


// POST /api/invoices - Create a new invoice
router.post('/', (req, res) => handleInvoiceResponse('createInvoice', req, res));

// GET /api/invoices - Get all invoices for the authenticated user
router.get('/', (req, res) => handleInvoiceResponse('getInvoices', req, res));

// GET /api/invoices/:id - Get a specific invoice by ID
router.get('/:id', (req, res) => handleInvoiceResponse('getInvoiceById', req, res));

// PUT /api/invoices/:id - Update an existing invoice
router.put('/:id', (req, res) => handleInvoiceResponse('updateInvoice', req, res));

// DELETE /api/invoices/:id - Delete an invoice
router.delete('/:id', (req, res) => handleInvoiceResponse('deleteInvoice', req, res));

// POST /api/invoices/:invoiceId/pay - Initiate payment for an invoice
// Note: The path parameter in Express will be req.params.invoiceId
router.post('/:invoiceId/pay', (req, res) => handlePaymentResponse('initiatePaymentForInvoice', req, res));

module.exports = router;

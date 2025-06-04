const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { checkRole } = require('../middleware/authMiddleware');

// Define all known profile types. Any authenticated user with one of these can manage their own invoices.
const allProfileTypes = ['freelance', 'accountant', 'sme', 'large_enterprise'];

// Protect all invoice routes - user must be authenticated and have a valid profile type.
router.use(checkRole(allProfileTypes));

// POST /api/invoices - Create a new invoice
router.post('/', invoiceController.createInvoice);

// GET /api/invoices - Get all invoices for the authenticated user (with pagination)
router.get('/', invoiceController.getInvoices);

// GET /api/invoices/:id - Get a specific invoice by ID
router.get('/:id', invoiceController.getInvoiceById);

// PUT /api/invoices/:id - Update an existing invoice
router.put('/:id', invoiceController.updateInvoice);

// DELETE /api/invoices/:id - Delete an invoice
router.delete('/:id', invoiceController.deleteInvoice);

module.exports = router;

const { ALLOWED_VAT_RATES } = require('../config/constants');

// Mock database for invoices
let mockInvoicesDb = [];
let nextInvoiceId = 1;

// Helper function to calculate invoice totals
const calculateTotals = (items, taxRate = 0) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount;
    return { subtotal, taxAmount, totalAmount };
};

// Helper function to generate invoice number (mock implementation)
const generateInvoiceNumber = (userId) => {
    const userInvoices = mockInvoicesDb.filter(inv => inv.user_id === userId);
    const lastInvoice = userInvoices.sort((a, b) => {
        const numA = parseInt(a.invoice_number.split('-').pop());
        const numB = parseInt(b.invoice_number.split('-').pop());
        return numA - numB;
    }).pop();

    let nextNum = 1;
    if (lastInvoice) {
        nextNum = parseInt(lastInvoice.invoice_number.split('-').pop()) + 1;
    }
    return `INV-${String(nextNum).padStart(3, '0')}`;
};


// --- Controller Functions ---

// POST /api/invoices
exports.createInvoice = (req, res) => {
    try {
        const { client_name, client_address, client_email, invoice_date, due_date, items, currency, notes, status = 'draft' } = req.body;
        let { tax_rate } = req.body; // tax_rate is handled specially for validation
        const userId = req.user.userId; // Extracted from JWT by auth middleware

        // Validation
        if (!client_name || !invoice_date || !due_date || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Missing required fields: client_name, invoice_date, due_date, items.' });
        }
        for (const item of items) {
            if (typeof item.description !== 'string' || typeof item.quantity !== 'number' || typeof item.unit_price !== 'number') {
                return res.status(400).json({ message: 'Each item must have description (string), quantity (number), and unit_price (number).' });
            }
            item.total_price_per_item = item.quantity * item.unit_price; // Ensure total_price_per_item is set
        }

        // Validate tax_rate
        if (tax_rate === undefined || tax_rate === null) {
            tax_rate = 0; // Default to 0 if not provided
        } else {
            tax_rate = parseFloat(tax_rate); // Ensure it's a number
            if (!ALLOWED_VAT_RATES.includes(tax_rate)) {
                return res.status(400).json({
                    message: `Invalid tax_rate. Must be one of: ${ALLOWED_VAT_RATES.join(', ')}.`,
                    allowed_rates: ALLOWED_VAT_RATES
                });
            }
        }

        const { subtotal, taxAmount, totalAmount } = calculateTotals(items, tax_rate);
        const invoiceNumber = generateInvoiceNumber(userId);

        const newInvoice = {
            id: nextInvoiceId++,
            user_id: userId,
            client_name,
            client_address: client_address || null,
            client_email: client_email || null,
            invoice_number: invoiceNumber,
            invoice_date,
            due_date,
            items,
            subtotal,
            tax_rate,
            tax_amount: taxAmount,
            total_amount: totalAmount,
            currency: currency || 'USD',
            status,
            notes: notes || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        mockInvoicesDb.push(newInvoice);
        res.status(201).json(newInvoice);
    } catch (error) {
        console.error('Create invoice error:', error);
        res.status(500).json({ message: 'Internal server error while creating invoice.' });
    }
};

// GET /api/invoices
exports.getInvoices = (req, res) => {
    try {
        const userId = req.user.userId;
        let userInvoices = mockInvoicesDb.filter(inv => inv.user_id === userId);

        // Basic Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const paginatedInvoices = userInvoices.slice(startIndex, endIndex);

        res.status(200).json({
            page,
            limit,
            totalPages: Math.ceil(userInvoices.length / limit),
            totalItems: userInvoices.length,
            invoices: paginatedInvoices
        });
    } catch (error) {
        console.error('Get invoices error:', error);
        res.status(500).json({ message: 'Internal server error while fetching invoices.' });
    }
};

// GET /api/invoices/:id
exports.getInvoiceById = (req, res) => {
    try {
        const userId = req.user.userId;
        const invoiceId = parseInt(req.params.id, 10);
        const invoice = mockInvoicesDb.find(inv => inv.id === invoiceId);

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found.' });
        }
        if (invoice.user_id !== userId) {
            // Although the list endpoint already filters by user, this is a direct access check
            return res.status(403).json({ message: 'Forbidden: You do not have access to this invoice.' });
        }

        res.status(200).json(invoice);
    } catch (error) {
        console.error('Get invoice by ID error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// PUT /api/invoices/:id
exports.updateInvoice = (req, res) => {
    try {
        const userId = req.user.userId;
        const invoiceId = parseInt(req.params.id, 10);
        const updates = req.body;
        let { tax_rate: newTaxRate } = req.body; // Handle new tax_rate separately

        let invoice = mockInvoicesDb.find(inv => inv.id === invoiceId);

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found.' });
        }
        if (invoice.user_id !== userId) {
            return res.status(403).json({ message: 'Forbidden: You cannot update this invoice.' });
        }

        // Fields that cannot be changed
        delete updates.id;
        delete updates.user_id;
        delete updates.invoice_number; // Invoice number should generally not be changed post-creation
        delete updates.created_at;

        // Update allowed fields
        Object.keys(updates).forEach(key => {
            if (key !== 'items' && key !== 'tax_rate' && invoice.hasOwnProperty(key)) {
                invoice[key] = updates[key];
            }
        });

        // Handle updates to items or tax_rate which require recalculation
        let needsRecalculation = false;
        if (updates.items && Array.isArray(updates.items) && updates.items.length > 0) {
            // Basic validation for incoming items
            for (const item of updates.items) {
                if (typeof item.description !== 'string' || typeof item.quantity !== 'number' || typeof item.unit_price !== 'number') {
                    return res.status(400).json({ message: 'Each updated item must have description (string), quantity (number), and unit_price (number).' });
                }
                item.total_price_per_item = item.quantity * item.unit_price;
            }
            invoice.items = updates.items;
            needsRecalculation = true;
        }

        // Validate and update tax_rate if provided
        if (newTaxRate !== undefined && newTaxRate !== null) {
            newTaxRate = parseFloat(newTaxRate);
            if (!ALLOWED_VAT_RATES.includes(newTaxRate)) {
                return res.status(400).json({
                    message: `Invalid tax_rate. Must be one of: ${ALLOWED_VAT_RATES.join(', ')}.`,
                    allowed_rates: ALLOWED_VAT_RATES
                });
            }
            if (invoice.tax_rate !== newTaxRate) {
                 invoice.tax_rate = newTaxRate;
                 needsRecalculation = true;
            }
        } else if (updates.hasOwnProperty('tax_rate') && (updates.tax_rate === null || updates.tax_rate === undefined)) {
            // If explicitly set to null/undefined, treat as 0 or reset, and recalculate
            if (invoice.tax_rate !== 0) {
                invoice.tax_rate = 0;
                needsRecalculation = true;
            }
        }


        if (needsRecalculation) {
            const { subtotal, taxAmount, totalAmount } = calculateTotals(invoice.items, invoice.tax_rate);
            invoice.subtotal = subtotal;
            invoice.tax_amount = taxAmount;
            invoice.total_amount = totalAmount;
        }

        invoice.updated_at = new Date().toISOString();

        // Replace in DB
        mockInvoicesDb = mockInvoicesDb.map(inv => (inv.id === invoiceId ? invoice : inv));

        res.status(200).json(invoice);
    } catch (error) {
        console.error('Update invoice error:', error);
        res.status(500).json({ message: 'Internal server error while updating invoice.' });
    }
};

// DELETE /api/invoices/:id
exports.deleteInvoice = (req, res) => {
    try {
        const userId = req.user.userId;
        const invoiceId = parseInt(req.params.id, 10);

        const invoiceIndex = mockInvoicesDb.findIndex(inv => inv.id === invoiceId);

        if (invoiceIndex === -1) {
            return res.status(404).json({ message: 'Invoice not found.' });
        }
        if (mockInvoicesDb[invoiceIndex].user_id !== userId) {
            return res.status(403).json({ message: 'Forbidden: You cannot delete this invoice.' });
        }

        mockInvoicesDb.splice(invoiceIndex, 1);
        res.status(204).send();
    } catch (error) {
        console.error('Delete invoice error:', error);
        res.status(500).json({ message: 'Internal server error while deleting invoice.' });
    }
};

// Export for use in other modules (like paymentController)
// This is a simplified approach for a mock environment.
// In a real app, you'd use a proper database and service layer.
module.exports.mockInvoicesDb = mockInvoicesDb;
module.exports.updateInvoiceStatus = (invoiceId, newStatus) => {
    const invoice = mockInvoicesDb.find(inv => inv.id === invoiceId);
    if (invoice) {
        invoice.status = newStatus;
        invoice.updated_at = new Date().toISOString();
        // In a real scenario, you might want to re-save/update the DB
        // For mockInvoicesDb, the change is in-memory.
        return true;
    }
    return false;
};

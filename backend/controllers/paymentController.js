const { mockInvoicesDb, updateInvoiceStatus } = require('./invoiceController'); // Import from invoiceController
const { v4: uuidv4 } = require('uuid'); // For generating unique providerTransactionId

// Mock database for payments
let mockPaymentsDb = [];
let nextPaymentId = 1;

// Allowed payment methods (can be expanded)
const ALLOWED_PAYMENT_METHODS = ['orange_money_senegal'];

// --- Controller Functions ---

// POST /api/payments/initiate
exports.initiatePayment = (req, res) => {
    try {
        const { invoiceId, paymentMethod, phoneNumber } = req.body;
        const userId = req.user.userId; // From JWT

        if (!invoiceId || !paymentMethod || !phoneNumber) {
            return res.status(400).json({ message: 'invoiceId, paymentMethod, and phoneNumber are required.' });
        }

        if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
            return res.status(400).json({ message: `Invalid paymentMethod. Allowed methods: ${ALLOWED_PAYMENT_METHODS.join(', ')}` });
        }

        const invoice = mockInvoicesDb.find(inv => inv.id === parseInt(invoiceId) && inv.user_id === userId);
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found or access denied.' });
        }

        // Check invoice status - e.g., only 'draft', 'sent', or 'overdue' invoices can be paid
        const payableStatuses = ['sent', 'overdue', 'draft']; // 'draft' might be allowed if user wants to pay immediately
        if (!payableStatuses.includes(invoice.status)) {
            return res.status(400).json({ message: `Invoice status "${invoice.status}" does not allow payment.` });
        }

        if (invoice.total_amount <= 0) {
            return res.status(400).json({ message: 'Invoice amount must be greater than zero to initiate payment.' });
        }

        // Mock Interaction with Orange Money API
        const providerTransactionId = `OM-${uuidv4()}`; // Simulate a unique ID from Orange Money
        console.log(`Simulating payment initiation with ${paymentMethod} for invoice ${invoiceId} to phone ${phoneNumber}. Provider Tx ID: ${providerTransactionId}`);

        const newPayment = {
            id: nextPaymentId++,
            invoice_id: invoice.id,
            user_id: userId,
            amount: invoice.total_amount,
            currency: invoice.currency,
            payment_method: paymentMethod,
            phone_number: phoneNumber, // Store the phone number used
            status: 'pending', // Initial status
            provider_transaction_id: providerTransactionId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        mockPaymentsDb.push(newPayment);

        res.status(201).json({
            paymentId: newPayment.id,
            status: newPayment.status,
            providerTransactionId: newPayment.provider_transaction_id,
            message: `Payment initiated with ${paymentMethod}. Waiting for confirmation.`
        });

    } catch (error) {
        console.error('Initiate payment error:', error);
        res.status(500).json({ message: 'Internal server error while initiating payment.' });
    }
};

// GET /api/payments/:paymentId/status
exports.checkPaymentStatus = (req, res) => {
    try {
        const paymentId = parseInt(req.params.paymentId);
        const userId = req.user.userId; // From JWT

        const payment = mockPaymentsDb.find(p => p.id === paymentId && p.user_id === userId);

        if (!payment) {
            return res.status(404).json({ message: 'Payment record not found or access denied.' });
        }

        // Mock Interaction with Orange Money API to get status
        // For this mock: if status is 'pending', the first time it's checked, change to 'completed'.
        // A more complex mock could use a timeout or random outcome.
        if (payment.status === 'pending') {
            // Simulate that the payment is now completed
            payment.status = 'completed';
            payment.updated_at = new Date().toISOString();
            console.log(`Simulating ${payment.payment_method} callback: Payment ${paymentId} (Provider Tx ID: ${payment.provider_transaction_id}) is now 'completed'.`);

            // Update corresponding invoice status to 'paid'
            const invoiceUpdated = updateInvoiceStatus(payment.invoice_id, 'paid');
            if (invoiceUpdated) {
                console.log(`Invoice ${payment.invoice_id} status updated to 'paid'.`);
            } else {
                console.error(`Failed to update status for invoice ${payment.invoice_id} after payment completion.`);
                // Potentially handle this error, e.g., queue for retry
            }
        }
        // Add a case for 'failed' if you want to simulate that
        // else if (payment.status === 'pending' && Math.random() < 0.1) { // 10% chance to fail
        //    payment.status = 'failed';
        //    payment.updated_at = new Date().toISOString();
        // }


        res.status(200).json({
            paymentId: payment.id,
            status: payment.status,
            amount: payment.amount,
            currency: payment.currency,
            paymentMethod: payment.payment_method,
            providerTransactionId: payment.provider_transaction_id,
            updatedAt: payment.updated_at
        });

    } catch (error) {
        console.error('Check payment status error:', error);
        res.status(500).json({ message: 'Internal server error while checking payment status.' });
    }
};

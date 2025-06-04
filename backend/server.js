const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Import actual route modules
const authRoutes = require('./routes/auth');
const invoiceRoutes = require('./routes/invoice');
const paymentRoutes = require('./routes/payment');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Mount routes
// The base path for authRoutes is /api/auth. Inside auth.js, routes are like /register, /login.
// So, POST /api/auth/register will hit the register route in auth.js.
app.use('/api/auth', authRoutes);

// The base path for invoiceRoutes is /api/invoices. Inside invoice.js, routes are like /, /:id, /:invoiceId/pay.
// So, GET /api/invoices will hit the getInvoices route, POST /api/invoices/:invoiceId/pay will hit initiatePaymentForInvoice.
app.use('/api/invoices', invoiceRoutes);

// The base path for paymentRoutes (webhooks) is /api/webhooks. Inside payment.js, routes are like /orangemoney/senegal/notification.
// So, POST /api/webhooks/orangemoney/senegal/notification will hit orangeMoneyNotificationWebhook.
app.use('/api/webhooks', paymentRoutes);

// Simple test route
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

// Global error handler (very basic)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

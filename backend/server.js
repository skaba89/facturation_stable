const express = require('express');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/adminRoutes'); // Import admin routes
const invoiceRoutes = require('./routes/invoiceRoutes'); // Import invoice routes
const utilityRoutes = require('./routes/utilityRoutes'); // Import utility routes
const paymentRoutes = require('./routes/paymentRoutes'); // Import payment routes

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Mount auth routes
app.use('/auth', authRoutes);

// Mount admin routes (prefixed with /api/admin)
app.use('/api/admin', adminRoutes);

// Mount invoice routes (prefixed with /api/invoices)
app.use('/api/invoices', invoiceRoutes);

// Mount utility routes (prefixed with /api/utils)
app.use('/api/utils', utilityRoutes);

// Mount payment routes (prefixed with /api/payments)
app.use('/api/payments', paymentRoutes);

// Simple route for testing
app.get('/', (req, res) => {
    res.send('Backend server is running!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Basic Error Handling Middleware (should be defined after all routes)
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.stack || err.message || err);
    // Avoid sending stack trace to client in production
    // For now, sending a generic message
    res.status(500).json({ message: 'Internal Server Error' });
});

// Export the app for potential testing or extension later
module.exports = app;

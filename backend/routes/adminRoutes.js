const express = require('express');
const router = express.Router();
const { checkRole } = require('../middleware/authMiddleware');

// Sample data - in a real app, this would come from a database or service
const dashboardData = {
    revenue: 1000000,
    activeUsers: 1500,
    pendingApprovals: 12,
    systemStatus: 'All systems operational'
};

// Protected route: GET /api/admin/dashboard-data
// Accessible only by users with 'accountant' or 'large_enterprise' profile_type.
router.get(
    '/dashboard-data',
    checkRole(['accountant', 'large_enterprise']), // Apply RBAC middleware
    (req, res) => {
        // If middleware passes, req.user will contain the decoded token payload
        res.json({
            message: `Welcome, ${req.user.profileType} (User ID: ${req.user.userId}). Here is your dashboard data.`,
            data: dashboardData
        });
    }
);

module.exports = router;

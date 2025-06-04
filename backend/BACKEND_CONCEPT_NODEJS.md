# Backend Conceptual Outline (Node.js/Express.js + PostgreSQL)

This document outlines the conceptual structure, key files, dependencies, and API endpoints for the backend of the invoicing application, built with Node.js and Express.js, and designed to work with a PostgreSQL database.

## 1. Project Structure (within `backend/`)

```
backend/
├── src/
│   ├── config/         # Database connections, environment variables loading (e.g., db.js, env.js)
│   ├── controllers/    # Request handlers (e.g., authController.js, invoiceController.js)
│   ├── middleware/     # Custom middleware (e.g., authMiddleware.js, errorMiddleware.js)
│   ├── models/         # Sequelize models/schemas (e.g., userModel.js, invoiceModel.js)
│   ├── routes/         # API endpoint definitions (e.g., authRoutes.js, invoiceRoutes.js)
│   ├── services/       # Business logic (e.g., rbacService.js, paymentService.js)
│   └── utils/          # Helper functions (e.g., logger.js, validationHelpers.js)
├── app.js              # Main Express application setup and server start
├── .env                # Environment variables (DATABASE_URL, JWT_SECRET, etc. - gitignored)
├── .sequelizerc        # (Optional) Sequelize CLI configuration
├── migrations/         # (Optional, if using Sequelize CLI) Database migration files
├── seeders/            # (Optional, if using Sequelize CLI) Database seeder files
└── package.json        # Project dependencies, scripts (start, dev, test)
```

*   **Python files as reference:** The existing `.py` files (`user.py`, `invoice.py` in `backend/models/`; `auth_controller.py`, `invoice_controller.py` in `backend/controllers/`; `rbac_service.py` in `backend/services/`) will serve as the primary reference for translating the logic and structure into their JavaScript/Node.js equivalents.

## 2. Key Files and their Purpose

*   **`app.js` (or `server.js`)**:
    *   Initializes the Express application: `const app = express();`.
    *   **Middleware Setup:**
        *   `express.json()`: For parsing `application/json` request bodies.
        *   `express.urlencoded({ extended: true })`: For parsing `application/x-www-form-urlencoded` bodies.
        *   `cors()`: Enable Cross-Origin Resource Sharing. Load from `cors` package.
        *   `morgan('dev')`: (Optional) HTTP request logger. Load from `morgan` package.
        *   Custom logging middleware (if needed).
    *   **Database Connection:**
        *   Import Sequelize setup from `src/config/db.js` (or directly initialize).
        *   Test database connection.
    *   **API Routes Mounting:**
        *   Import route handlers from `src/routes/` (e.g., `authRoutes`, `invoiceRoutes`).
        *   Mount them: `app.use('/api/auth', authRoutes);`, `app.use('/api/invoices', invoiceRoutes);`, etc.
    *   **Error Handling Middleware:**
        *   A generic error handler (e.g., `app.use(errorMiddleware);`) placed after all routes to catch and process errors.
    *   **Server Start:**
        *   `const PORT = process.env.PORT || 3001;`
        *   `app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));`

*   **`src/config/db.js` (Conceptual for Sequelize):**
    *   `const { Sequelize } = require('sequelize');`
    *   `const sequelize = new Sequelize(process.env.DATABASE_URL, { dialect: 'postgres', logging: false });`
    *   Exports `sequelize` instance.
    *   May include logic to load models dynamically.

*   **`src/routes/` (e.g., `authRoutes.js`, `invoiceRoutes.js`, `paymentRoutes.js`):**
    *   `const express = require('express');`
    *   `const router = express.Router();`
    *   Import corresponding controller functions (e.g., `const { registerUser, loginUser } = require('../controllers/authController');`).
    *   Define routes:
        *   `router.post('/register', registerUser);`
        *   `router.post('/login', loginUser);`
        *   `router.post('/', authMiddleware.authenticateToken, invoiceController.createInvoice);` (example with middleware)
    *   `module.exports = router;`

*   **`src/controllers/` (e.g., `authController.js`, `invoiceController.js`, `paymentController.js`):**
    *   Each function will take `(req, res, next)` as arguments.
    *   **Logic Translation:** Adapt Python logic from `*_controller.py` files.
    *   **Input Validation:** Use a library like `Joi` or `express-validator`, or manual checks.
    *   **Service Interaction:** Call functions from `src/services/` for business logic.
    *   **Model Interaction:** Directly use Sequelize models for DB operations if services are thin.
    *   **Response Handling:** `res.status(200).json({ message: 'Success', data: ... });` or `res.status(400).json({ error: '...' });`.
    *   Use `async/await` and `try/catch` blocks for asynchronous operations and error handling, passing errors to `next(error)`.

*   **`src/models/` (e.g., `userModel.js`, `invoiceModel.js` using Sequelize):**
    *   `const { DataTypes } = require('sequelize');`
    *   `const sequelize = require('../config/db');` (or however Sequelize instance is provided)
    *   Define Sequelize models mirroring the Python classes:
        ```javascript
        // Example: userModel.js
        const User = sequelize.define('User', {
          id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
          email: { type: DataTypes.STRING, unique: true, allowNull: false, validate: { isEmail: true } },
          password: { type: DataTypes.STRING, allowNull: false },
          profile_type: { type: DataTypes.ENUM('freelance', 'accountant', 'sme', 'large_enterprise'), allowNull: false },
          // Timestamps createdAt and updatedAt are handled by Sequelize by default
        });
        // Define associations here (e.g., User.hasMany(Invoice))
        module.exports = User;
        ```
    *   Similarly for `Invoice` model, including line items (which might be a separate associated model or JSONB field).
    *   `InvoiceLineItem` could be a separate model associated with `Invoice`.

*   **`src/services/` (e.g., `rbacService.js`, `paymentService.js`, `invoiceService.js`):**
    *   Encapsulate business logic.
    *   `rbacService.js`: Translate Python `rbac_service.py` logic for `checkPermission(userRole, requiredPermission)`.
    *   `paymentService.js`: Handle interactions with Orange Money API (conceptual calls).
    *   May interact with Sequelize models.

*   **`src/middleware/` (e.g., `authMiddleware.js`, `errorMiddleware.js`):**
    *   `authMiddleware.js`:
        *   `authenticateToken(req, res, next)`: Verifies JWT from `Authorization` header. If valid, adds `req.user` object. Otherwise, sends 401/403.
        *   `authorizeRole(requiredPermission)`: Returns a middleware function that uses `rbacService.checkPermission(req.user.profile_type, requiredPermission)`. If not permitted, sends 403.
    *   `errorMiddleware.js`:
        *   `function errorMiddleware(err, req, res, next) { ... }`: Logs the error and sends a standardized JSON error response.

*   **`.env` (Example):**
    ```
    NODE_ENV=development
    PORT=3001
    DATABASE_URL=postgresql://user:password@host:port/database_name
    JWT_SECRET=your_very_strong_jwt_secret
    ORANGE_MONEY_API_KEY=your_orange_money_key
    ORANGE_MONEY_MERCHANT_KEY=your_orange_money_merchant_key
    ```

*   **`package.json` (Key Scripts):**
    ```json
    {
      "name": "backend",
      "version": "1.0.0",
      "main": "app.js",
      "scripts": {
        "start": "node app.js",
        "dev": "nodemon app.js", // Requires nodemon
        "test": "echo \"Error: no test specified\" && exit 1"
      },
      "dependencies": {
        // To be filled in (see section 3)
      }
    }
    ```

## 3. Dependencies (Conceptual `npm install ...`)

*   **Core:**
    *   `express`: Web framework.
    *   `dotenv`: For loading environment variables from `.env` file.
*   **Database (PostgreSQL):**
    *   `pg`: PostgreSQL client.
    *   `sequelize`: ORM for PostgreSQL.
    *   `sequelize-cli`: (Optional) For migrations and seeding.
*   **Authentication & Security:**
    *   `bcryptjs`: For hashing passwords.
    *   `jsonwebtoken`: For creating and verifying JSON Web Tokens.
    *   `cors`: For enabling CORS.
*   **Utilities:**
    *   `morgan`: (Optional) HTTP request logger.
    *   `joi` or `express-validator`: (Optional) For advanced input validation.
*   **Development:**
    *   `nodemon`: For automatically restarting the server during development.

## 4. API Endpoint Summary (Reiteration from Previous Designs)

This backend structure will support the following conceptual API endpoints:

*   **Authentication (`/api/auth`):**
    *   `POST /register`: User registration.
    *   `POST /login`: User login.
*   **Invoices (`/api/invoices`):**
    *   `POST /`: Create a new invoice (Requires Auth).
    *   `GET /`: List invoices for the user (Requires Auth).
    *   `GET /:id`: Get a specific invoice (Requires Auth).
    *   `PUT /:id`: Update an invoice (Requires Auth).
    *   `DELETE /:id`: Delete an invoice (Requires Auth).
*   **Payments (`/api/payments` or integrated into invoices):**
    *   `POST /invoices/:id/pay/orangemoney`: Initiate payment for an invoice via Orange Money (Requires Auth).
    *   `POST /orangemoney/callback`: Callback URL for Orange Money to send payment status updates.
    *   `GET /invoices/:id/payment_status`: Check payment status of an invoice (Requires Auth).

This conceptual outline provides a Node.js/Express.js specific structure that mirrors the functionality and design previously laid out in Python-based conceptual files.
The actual implementation will involve translating Python logic to JavaScript, setting up Sequelize models based on the Python classes, and wiring everything together with Express.

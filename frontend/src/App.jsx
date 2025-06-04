import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';

// Import Page Components
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import DashboardPage from './pages/DashboardPage';
import InvoicesPage from './pages/InvoicesPage';
import InvoiceDetailPage from './pages/InvoiceDetailPage';
import CreateEditInvoicePage from './pages/CreateEditInvoicePage';

// Basic Navbar for navigation - will be replaced by MainLayout later
const Navbar = () => (
  <nav className="bg-blue-600 p-4 text-white">
    <ul className="flex space-x-4">
      <li><Link to="/">Dashboard</Link></li>
      <li><Link to="/login">Login</Link></li>
      <li><Link to="/register">Register</Link></li>
      <li><Link to="/invoices">Invoices</Link></li>
      <li><Link to="/invoices/new">Create Invoice</Link></li>
    </ul>
  </nav>
);

function App() {
  return (
    <Router>
      <Navbar /> {/* Simple navigation, replace with a proper Layout component later */}
      <div className="app-content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/invoice/:invoiceId" element={<InvoiceDetailPage />} /> {/* For viewing a single invoice */}
          <Route path="/invoices/new" element={<CreateEditInvoicePage />} />
          <Route path="/invoices/edit/:invoiceId" element={<CreateEditInvoicePage />} /> {/* For editing an invoice */}
          {/* Add other routes here */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;

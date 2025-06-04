import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button'; // Import the reusable Button

// Placeholder data - replace with API call and state management
const invoices = [
  { id: 'INV-001', raw_id: '1', client: 'Tech Corp', issue_date: '2024-05-01', due_date: '2024-06-01', total: 'XOF 500,000', status: 'Paid', payment_transaction_id: 'TXN123' },
  { id: 'INV-002', raw_id: '2', client: 'Innovate Ltd.', issue_date: '2024-05-15', due_date: '2024-06-15', total: 'XOF 1,250,000', status: 'Sent', payment_transaction_id: null },
  { id: 'INV-003', raw_id: '3', client: 'Solutions Inc.', issue_date: '2024-04-20', due_date: '2024-05-20', total: 'XOF 300,000', status: 'Overdue', payment_transaction_id: null },
];

const InvoicesPage = () => {
  const handleDeleteInvoice = (invoiceId) => {
    // Placeholder for delete functionality
    alert(`Delete invoice ${invoiceId}? (Placeholder)`);
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4 sm:mb-0">Invoices</h1>
        <Link to="/invoices/new">
          <Button variant="primary">Create New Invoice</Button>
        </Link>
      </header>

      {/* Placeholder for filters and search bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search invoices (e.g., client, invoice #)..."
          className="p-2 border border-gray-300 rounded-md w-full md:w-1/3 shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
        {/* Add filter dropdowns e.g. by status */}
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Invoice #</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Issue Date</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.id}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{invoice.client}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{invoice.issue_date}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{invoice.due_date}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{invoice.total}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'Sent' ? 'bg-blue-100 text-blue-800' :
                    invoice.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                    invoice.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-200 text-gray-800' // Added pending_payment
                  }`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
                  <Link to={`/invoice/${invoice.raw_id}`}> {/* Use raw_id for URL param if id is formatted string */}
                    <Button variant="neutral" className="text-xs">View</Button>
                  </Link>
                  <Link to={`/invoices/edit/${invoice.raw_id}`}>
                    <Button variant="secondary" className="text-xs">Edit</Button>
                  </Link>
                  {/* Conditional Pay Button Placeholder - actual logic might be different */}
                  {!invoice.payment_transaction_id && invoice.status !== 'Paid' && invoice.status !== 'pending_payment' && (
                     <Button variant="primary" className="text-xs bg-green-500 hover:bg-green-600 focus:ring-green-400">Pay</Button>
                  )}
                   <Button variant="danger" className="text-xs" onClick={() => handleDeleteInvoice(invoice.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Placeholder for pagination */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">(Pagination placeholder)</p>
      </div>
    </div>
  );
};

export default InvoicesPage;

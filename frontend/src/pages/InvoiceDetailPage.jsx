import React from 'react';
// import { useParams } from 'react-router-dom'; // To get invoice ID from URL

// Placeholder data - replace with API call based on ID
const invoiceDetails = {
  id: 'INV-001',
  user: { name: 'Your Company Name', address: '123 Main St, Dakar, Senegal', email: 'contact@yourcompany.com', logo_url: 'https://via.placeholder.com/150?text=Your+Logo' },
  client: { name: 'Tech Corp', address: '456 Client Ave, Dakar, Senegal', email: 'billing@techcorp.com' },
  invoice_number: 'INV-001',
  issue_date: '2024-05-01',
  due_date: '2024-06-01',
  items: [
    { id: 1, description: 'Web Development Services', quantity: 1, unit_price: 350000, total_price: 350000 },
    { id: 2, description: 'Consulting Hours', quantity: 5, unit_price: 30000, total_price: 150000 },
  ],
  subtotal: 500000,
  tax_rate: 0.18, // 18%
  tax_amount: 90000,
  total_amount: 590000,
  currency: 'XOF',
  status: 'Paid',
  notes: 'Thank you for your business!',
  payment_method: 'orangemoney_senegal',
  payment_transaction_id: 'TXN123ABC',
  template_id: 'modern', // For styling or specific template rendering
  color_scheme: '#4A90E2' // Example color
};

const InvoiceDetailPage = () => {
  // const { invoiceId } = useParams(); // Get invoiceId from route params

  // Fetch invoice details based on invoiceId here
  // For now, using placeholder data.
  const invoice = invoiceDetails;

  if (!invoice) {
    return <div className="p-6 text-center text-red-500">Invoice not found.</div>;
  }

  const primaryColor = invoice.color_scheme || '#4A90E2'; // Fallback color

  return (
    <div className="p-6 md:p-10 bg-gray-100 min-h-screen">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Invoice {invoice.invoice_number}</h1>
        <div>
          <button className="py-2 px-4 mr-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            Download PDF
          </button>
          <button className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Edit Invoice
          </button>
        </div>
      </header>

      <div className="bg-white shadow-xl rounded-lg p-6 md:p-10">
        {/* Invoice Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            {invoice.user.logo_url && <img src={invoice.user.logo_url} alt="Company Logo" className="h-16 mb-4"/>}
            <h2 className="text-2xl font-bold" style={{color: primaryColor}}>{invoice.user.name}</h2>
            <p className="text-gray-600">{invoice.user.address}</p>
            <p className="text-gray-600">{invoice.user.email}</p>
          </div>
          <div className="text-right">
            <h3 className="text-4xl font-bold uppercase" style={{color: primaryColor}}>Invoice</h3>
            <p className="text-gray-700"># <span className="font-semibold">{invoice.invoice_number}</span></p>
            <p className="text-gray-700">Status:
              <span className={`ml-1 px-2 py-0.5 inline-flex text-sm leading-5 font-semibold rounded-full ${
                  invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                  invoice.status === 'Sent' ? 'bg-blue-100 text-blue-800' :
                  invoice.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                  invoice.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                }`}>
                {invoice.status}
              </span>
            </p>
          </div>
        </div>

        {/* Client and Dates */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <h4 className="font-semibold text-gray-700 mb-1">Bill To:</h4>
            <p className="font-bold text-gray-800">{invoice.client.name}</p>
            <p className="text-gray-600">{invoice.client.address}</p>
            <p className="text-gray-600">{invoice.client.email}</p>
          </div>
          <div className="text-left md:text-right">
            <p><span className="font-semibold text-gray-700">Issue Date:</span> {invoice.issue_date}</p>
            <p><span className="font-semibold text-gray-700">Due Date:</span> {invoice.due_date}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full divide-y divide-gray-300">
            <thead style={{backgroundColor: primaryColor}}>
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-sm font-semibold text-white">Description</th>
                <th scope="col" className="px-4 py-3 text-center text-sm font-semibold text-white">Quantity</th>
                <th scope="col" className="px-4 py-3 text-right text-sm font-semibold text-white">Unit Price</th>
                <th scope="col" className="px-4 py-3 text-right text-sm font-semibold text-white">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{item.description}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">{item.quantity}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">{invoice.currency} {item.unit_price.toLocaleString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-semibold text-right">{invoice.currency} {item.total_price.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-full md:w-1/3">
            <div className="flex justify-between py-1">
              <span className="text-gray-700">Subtotal:</span>
              <span className="text-gray-900 font-semibold">{invoice.currency} {invoice.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-700">Tax ({invoice.tax_rate * 100}%):</span>
              <span className="text-gray-900 font-semibold">{invoice.currency} {invoice.tax_amount.toLocaleString()}</span>
            </div>
            <hr className="my-2"/>
            <div className="flex justify-between py-1">
              <span className="text-xl font-bold text-gray-900">Total:</span>
              <span className="text-xl font-bold" style={{color: primaryColor}}>{invoice.currency} {invoice.total_amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Notes and Payment Info */}
        {invoice.notes && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-700 mb-1">Notes:</h4>
            <p className="text-gray-600 text-sm">{invoice.notes}</p>
          </div>
        )}
        {invoice.payment_transaction_id && (
          <div>
            <h4 className="font-semibold text-gray-700 mb-1">Payment Information:</h4>
            <p className="text-gray-600 text-sm">Method: {invoice.payment_method}</p>
            <p className="text-gray-600 text-sm">Transaction ID: {invoice.payment_transaction_id}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetailPage;

import React, { useEffect, useState } from 'react';
import { fetchInvoices } from '../services/api';
// import { Link } from 'react-router-dom'; // For "Create Invoice" button

const InvoicesPage = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });

    useEffect(() => {
        const loadInvoices = async () => {
            try {
                setLoading(true);
                // const params = { page: pagination.page, limit: pagination.limit };
                const response = await fetchInvoices(/*params*/); // Add params if pagination is implemented
                setInvoices(response.data.invoices || []); // Assuming backend returns { invoices: [...] }
                // setPagination(prev => ({ ...prev, totalPages: response.data.totalPages, totalItems: response.data.totalItems }));
                setError('');
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch invoices.');
                setInvoices([]);
            } finally {
                setLoading(false);
            }
        };
        loadInvoices();
    }, [/*pagination.page, pagination.limit*/]); // Re-fetch if pagination changes

    if (loading) return <p>Loading invoices...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h2>My Invoices</h2>
            {/* <Link to="/invoices/create">Create New Invoice</Link> */} {/* Placeholder for create invoice button/link */}
            <button onClick={() => alert('Placeholder for Create Invoice form/modal')}>Create New Invoice</button>

            {invoices.length === 0 ? (
                <p>No invoices found.</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {invoices.map(invoice => (
                        <li key={invoice.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                            <p><strong>Invoice #:</strong> {invoice.invoice_number}</p>
                            <p><strong>Client:</strong> {invoice.client_name}</p>
                            <p><strong>Amount:</strong> {invoice.total_amount} {invoice.currency}</p>
                            <p><strong>Status:</strong> {invoice.status}</p>
                            <p><strong>Due Date:</strong> {new Date(invoice.due_date).toLocaleDateString()}</p>
                            {/* Add more details or links to view/edit/pay invoice */}
                        </li>
                    ))}
                </ul>
            )}
            {/* Add pagination controls here if implemented */}
        </div>
    );
};

export default InvoicesPage;

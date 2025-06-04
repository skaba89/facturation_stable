import React from 'react';

const DashboardPage = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen"> {/* Assuming this page will be part of a layout with navbar/sidebar */}
      <header className="mb-6">
        <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder cards for dashboard items */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-blue-600 mb-2">Invoices Overview</h2>
          <p className="text-gray-700">Total unpaid: XOF 1,234,567</p>
          <p className="text-gray-700">Total overdue: XOF 234,567</p>
          {/* More stats or a chart placeholder could go here */}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-green-600 mb-2">Recent Activity</h2>
          <ul className="list-disc list-inside text-gray-700">
            <li>Invoice #INV-001 sent.</li>
            <li>Payment received for #INV-003.</li>
            <li>New client "Tech Solutions Ltd." added.</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-indigo-600 mb-2">Quick Actions</h2>
          <button className="mt-2 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Create New Invoice
          </button>
          <button className="mt-2 w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Manage Clients
          </button>
        </div>
      </div>
      {/* Further sections or components can be added here */}
    </div>
  );
};

export default DashboardPage;

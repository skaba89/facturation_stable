// Placeholder for Invoice model (e.g., using Sequelize or similar ORM)

const invoiceSchema = {
  invoice_number: {
    type: 'String',
    unique: true,
    required: true,
  },
  user_id: {
    type: 'ForeignKey', // References User model's ID
    required: true,
  },
  client_name: {
    type: 'String',
    required: true,
  },
  // ... other existing client and date fields ...
  client_address: { type: 'String' },
  client_email: { type: 'String' },
  issue_date: { type: 'Date', required: true, default: 'today()' },
  due_date: { type: 'Date', required: true },
  items: {
    type: 'Array',
    of: {
      type: 'Object',
      schema: {
        description: { type: 'String', required: true },
        quantity: { type: 'Number', required: true },
        unit_price: { type: 'Number', required: true },
        total_price: { type: 'Number', required: true },
      },
    },
  },
  subtotal: { type: 'Number', required: true },
  tax_rate: { type: 'Number', default: 0 },
  tax_amount: { type: 'Number', default: 0 },
  total_amount: { type: 'Number', required: true },
  status: {
    type: 'Enum',
    values: ['draft', 'sent', 'paid', 'overdue', 'cancelled', 'pending_payment'], // Added pending_payment
    default: 'draft',
    required: true,
  },
  notes: { type: 'String' },
  currency: { type: 'String', default: 'USD', required: true },
  template_id: { type: 'String', default: 'modern' },
  logo_url: { type: 'String', optional: true },
  color_scheme: { type: 'String', optional: true, default: '#4A90E2' },

  // New fields for payment integration
  payment_method: {
    type: 'String', // e.g., 'orangemoney_senegal', 'stripe', 'paypal'
    optional: true,
  },
  payment_transaction_id: { // Stores ID from the payment gateway
    type: 'String',
    optional: true,
  },
  payment_status: { // Specific status from payment gateway or internal mapping
    type: 'String', // e.g., 'pending', 'awaiting_confirmation', 'completed', 'failed', 'refunded'
    optional: true,
  },
  // Timestamps
  created_at: { type: 'Timestamp', default: 'now()' },
  updated_at: { type: 'Timestamp', default: 'now()' },
};

module.exports = invoiceSchema;

// Placeholder for Invoice Controller

// const invoiceService = require('../services/invoiceService');
// const { validationResult } = require('express-validator');

const invoiceController = {
  createInvoice: async (req, res) => {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   return res.status(400).json({ errors: errors.array() });
    // }

    try {
      const {
        client_name, client_address, client_email, issue_date, due_date, items,
        // subtotal, tax_amount, total_amount are calculated by service
        tax_rate, // tax_rate is provided by user
        status, notes, currency,
        template_id, logo_url, color_scheme
      } = req.body;

      const userId = req.user ? req.user.id : 'test_user_id';

      // Note: subtotal, tax_amount, total_amount will be calculated by the service
      // based on items and tax_rate.
      const invoiceData = {
        client_name, client_address, client_email, issue_date, due_date, items,
        tax_rate, // Pass user-provided or default tax_rate
        status, notes, currency,
        template_id, logo_url, color_scheme,
        user_id: userId // Ensure user_id is passed for service context
      };

      // const newInvoice = await invoiceService.createInvoice(invoiceData, userId);
      // res.status(201).json(newInvoice);

      // Simulating service call (service will do calculations)
      const serviceResponse = { // Mock response from invoiceService.createInvoice
          ...invoiceData, // Input data
          // Calculated fields that would be added by service:
          subtotal: (items && items.length > 0) ? items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) : 0,
          // tax_amount: calculated_tax_amount, // Mock
          // total_amount: calculated_total_amount, // Mock
          id: `inv_${Date.now()}`,
          invoice_number: `INV-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
      };
      // Simulate service calculation for response message
      try {
        const calculatedData = invoiceService._calculateInvoiceAmounts({ // Use the actual service's helper for consistent mock
            items: serviceResponse.items,
            tax_rate: serviceResponse.tax_rate
        });
        serviceResponse.subtotal = calculatedData.subtotal;
        serviceResponse.tax_amount = calculatedData.tax_amount;
        serviceResponse.total_amount = calculatedData.total_amount;
      } catch (e) { /* ignore calculation error for mock response if basic data is bad */ }


      console.log('Controller: Passing to service for creation:', invoiceData);
      res.status(201).json({ message: 'Invoice created successfully (placeholder)', data: serviceResponse });

    } catch (error) {
      // console.error('Create invoice error:', error);
      // if (error.message.startsWith('Invalid tax rate') || error.message.startsWith('Invalid item quantity')) {
      //   return res.status(400).json({ message: error.message });
      // }
      // res.status(500).json({ message: 'Error creating invoice' });
      res.status(500).json({ message: `Error creating invoice (placeholder): ${error.message}` });
    }
  },

  getInvoices: async (req, res) => {
    // ... (existing code)
    try {
      const userId = req.user ? req.user.id : 'test_user_id';
      res.status(200).json({ message: 'Invoices fetched (placeholder)', userId, invoices: [] });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching invoices (placeholder)', error: error.message });
    }
  },

  getInvoiceById: async (req, res) => {
    // ... (existing code)
    try {
      const invoiceId = req.params.id;
      const userId = req.user ? req.user.id : 'test_user_id';
      const mockInvoiceFromService = { /* ... existing mock ... */ };
      if (invoiceId === 'test_inv_id_for_user_' + userId || invoiceId.startsWith('inv_')) {
         res.status(200).json({ message: `Invoice ${invoiceId} fetched (placeholder)`, data: mockInvoiceFromService });
      } else {
         res.status(404).json({ message: 'Invoice not found (placeholder)'});
      }
    } catch (error) {
      res.status(500).json({ message: 'Error fetching invoice (placeholder)', error: error.message });
    }
  },

  updateInvoice: async (req, res) => {
    try {
      const invoiceId = req.params.id;
      const {
        client_name, client_address, client_email, issue_date, due_date, items,
        tax_rate, // tax_rate can be updated
        status, notes, currency,
        template_id, logo_url, color_scheme
      } = req.body;

      const userId = req.user ? req.user.id : 'test_user_id';

      const updateData = {
        client_name, client_address, client_email, issue_date, due_date, items,
        tax_rate,
        status, notes, currency,
        template_id, logo_url, color_scheme
      };

      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

      // const updatedInvoice = await invoiceService.updateInvoiceForUser(invoiceId, updateData, userId);
      // if (!updatedInvoice) { ... }
      // res.status(200).json(updatedInvoice);

      // Simulating service call
      let serviceResponse = { // Mock response from invoiceService.updateInvoiceForUser
          id: invoiceId,
          user_id: userId,
          ...updateData, // Input data for update
          updated_at: new Date().toISOString(),
      };
       // Simulate service calculation for response message
      try {
        // For a realistic mock, we'd need the full item set if `items` isn't in updateData
        // This mock assumes `updateData` has enough info if recalculation is needed
        const calculatedData = invoiceService._calculateInvoiceAmounts({
            items: serviceResponse.items, // Might be undefined if not updating items
            tax_rate: serviceResponse.tax_rate, // Might be undefined
            subtotal: serviceResponse.items ? serviceResponse.items.reduce((sum, item) => sum + (item.quantity * item.unit_price),0) : 0 // Temp subtotal if items present
        });
        serviceResponse.subtotal = calculatedData.subtotal;
        serviceResponse.tax_amount = calculatedData.tax_amount;
        serviceResponse.total_amount = calculatedData.total_amount;
      } catch (e) { /* ignore calculation error for mock response */ }


      console.log('Controller: Passing update to service:', updateData);
      if (invoiceId === 'test_inv_id_for_user_' + userId || invoiceId.startsWith('inv_')) {
        res.status(200).json({ message: `Invoice ${invoiceId} updated (placeholder)`, data: serviceResponse });
      } else {
         res.status(404).json({ message: 'Invoice not found for update (placeholder)'});
      }

    } catch (error) {
      // if (error.message.startsWith('Invalid tax rate') || error.message.startsWith('Invalid item quantity')) {
      //   return res.status(400).json({ message: error.message });
      // }
      // res.status(500).json({ message: 'Error updating invoice' });
      res.status(500).json({ message: `Error updating invoice (placeholder): ${error.message}` });
    }
  },

  deleteInvoice: async (req, res) => {
    // ... (existing code)
    try {
      const invoiceId = req.params.id;
      const userId = req.user ? req.user.id : 'test_user_id';
      if (invoiceId === 'test_inv_id_for_user_' + userId || invoiceId.startsWith('inv_')) {
        res.status(200).json({ message: `Invoice ${invoiceId} deleted (placeholder)`, userId });
      } else {
         res.status(404).json({ message: 'Invoice not found for delete (placeholder)'});
      }
    } catch (error) {
      res.status(500).json({ message: 'Error deleting invoice (placeholder)', error: error.message });
    }
  },
};

// Need to re-add the _calculateInvoiceAmounts to the module exports if it's used by the controller for mocking.
// However, it's better if the controller does not know about service's private helpers.
// For cleaner mocking, the controller would just expect the service to return the fully calculated data.
// The mock in the controller's `createInvoice` and `updateInvoice` that tries to replicate service calculations
// should ideally be removed, and the mock `serviceResponse` should just be a complete object as if the service ran.

// Re-exposing for controller's mock only (not ideal for real app structure)
invoiceController._calculateInvoiceAmounts = invoiceService._calculateInvoiceAmounts;


module.exports = invoiceController;

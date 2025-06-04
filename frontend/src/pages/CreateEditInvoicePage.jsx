import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import Select from '../components/Select';

// VAT Rates for the dropdown - this might come from a config or context later
const vatRateOptions = [
  { value: 0, label: '0% (Exempt/Not Applicable)' },
  { value: 0.05, label: '5%' },
  { value: 0.055, label: '5.5%' },
  { value: 0.10, label: '10%' },
  { value: 0.20, label: '20%' },
  { value: 0.30, label: '30%' },
];

const templateOptions = [
    { value: 'modern', label: 'Modern' },
    { value: 'classic', label: 'Classic' },
    { value: 'simple', label: 'Simple' },
];

const currencyOptions = [
    { value: 'XOF', label: 'XOF (FCFA)' },
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
];

const CreateEditInvoicePage = () => {
  // const { invoiceId } = useParams();
  // const navigate = useNavigate();
  // const isEditMode = Boolean(invoiceId);

  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_address: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    currency: 'XOF',
    items: [{ description: '', quantity: 1, unit_price: 0, total_price: 0 }],
    notes: '',
    tax_rate: 0.18, // Default tax rate
    template_id: 'modern',
    color_scheme: '#4A90E2', // Default color from Tiime's palette
    logo_url: '',
    subtotal: 0,
    tax_amount: 0,
    total_amount: 0,
  });

  // useEffect(() => {
  //   if (isEditMode) { /* Fetch invoice data logic */ }
  // }, [invoiceId, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSelectChange = (name, value) => { // For custom Select component
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const items = [...formData.items];
    items[index][name] = (name === 'quantity' || name === 'unit_price') ? parseFloat(value) || 0 : value;
    items[index].total_price = parseFloat((items[index].quantity * items[index].unit_price).toFixed(2));
    setFormData(prev => ({ ...prev, items }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unit_price: 0, total_price: 0 }],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length <= 1) return; // Keep at least one item
    const items = [...formData.items];
    items.splice(index, 1);
    setFormData(prev => ({ ...prev, items }));
  };

  useEffect(() => {
    let currentSubtotal = 0;
    formData.items.forEach(item => {
      currentSubtotal += item.total_price;
    });
    currentSubtotal = parseFloat(currentSubtotal.toFixed(2));

    const currentTaxRate = parseFloat(formData.tax_rate) || 0;
    const currentTaxAmount = parseFloat((currentSubtotal * currentTaxRate).toFixed(2));
    const currentTotalAmount = parseFloat((currentSubtotal + currentTaxAmount).toFixed(2));

    setFormData(prev => ({
      ...prev,
      subtotal: currentSubtotal,
      tax_amount: currentTaxAmount,
      total_amount: currentTotalAmount,
    }));
  }, [formData.items, formData.tax_rate]);

  const handleSave = (status = 'draft') => {
    // e.preventDefault(); // if called directly from button onClick without form.onSubmit
    console.log(`Saving invoice with status: ${status}`, formData);
    // Placeholder for API call
    // if (isEditMode) {
    //   // invoiceService.updateInvoice(invoiceId, { ...formData, status });
    // } else {
    //   // invoiceService.createInvoice({ ...formData, status });
    // }
    // navigate('/invoices');
    alert(`Invoice saved as ${status} (placeholder) - check console.`);
  };


  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
      <header className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
          {/* {isEditMode ? `Edit Invoice ${invoiceId}` : 'Create New Invoice'} */}
          Create / Edit Invoice
        </h1>
      </header>

      <form onSubmit={(e) => { e.preventDefault(); handleSave('sent'); }} className="bg-white shadow-xl rounded-lg p-6 space-y-8">

        <fieldset className="grid md:grid-cols-3 gap-x-6 gap-y-4 border p-4 rounded-md shadow-sm">
          <legend className="text-xl font-semibold text-blue-700 px-2 mb-2">Client Details</legend>
          <Input label="Client Name" id="client_name" name="client_name" value={formData.client_name} onChange={handleInputChange} required placeholder="e.g., Tech Solutions Inc."/>
          <Input label="Client Email" id="client_email" name="client_email" type="email" value={formData.client_email} onChange={handleInputChange} placeholder="client@example.com"/>
          <div className="md:col-span-3">
            <label htmlFor="client_address" className="block text-sm font-medium text-gray-700 mb-1">Client Address</label>
            <textarea name="client_address" id="client_address" value={formData.client_address} onChange={handleInputChange} rows="3" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="123 Client Street, City, Country"></textarea>
          </div>
        </fieldset>

         <fieldset className="grid md:grid-cols-3 gap-x-6 gap-y-4 border p-4 rounded-md shadow-sm">
          <legend className="text-xl font-semibold text-blue-700 px-2 mb-2">Invoice Meta</legend>
          <Input label="Issue Date" id="issue_date" name="issue_date" type="date" value={formData.issue_date} onChange={handleInputChange} required />
          <Input label="Due Date" id="due_date" name="due_date" type="date" value={formData.due_date} onChange={handleInputChange} required />
          <Select label="Currency" id="currency" name="currency" value={formData.currency} onChange={(e) => handleSelectChange('currency', e.target.value)} options={currencyOptions} required />
        </fieldset>

        <fieldset className="border p-4 rounded-md shadow-sm">
            <legend className="text-xl font-semibold text-blue-700 px-2 mb-4">Invoice Items</legend>
            {formData.items.map((item, index) => (
            <div key={index} className="grid md:grid-cols-12 gap-3 items-end mb-4 p-3 border rounded-lg bg-gray-50/50">
                <div className="md:col-span-5">
                    <Input label="Description" id={`item_description_${index}`} name="description" value={item.description} onChange={(e) => handleItemChange(index, e)} required placeholder="Service or Product"/>
                </div>
                <div className="md:col-span-2">
                    <Input label="Quantity" id={`item_quantity_${index}`} name="quantity" type="number" value={item.quantity} onChange={(e) => handleItemChange(index, e)} required placeholder="1"/>
                </div>
                <div className="md:col-span-2">
                    <Input label="Unit Price" id={`item_unit_price_${index}`} name="unit_price" type="number" value={item.unit_price} onChange={(e) => handleItemChange(index, e)} required placeholder="0.00"/>
                </div>
                <div className="md:col-span-2 flex flex-col items-start md:items-end justify-end h-full pb-4"> {/* Adjusted for alignment */}
                    <span className="text-sm text-gray-700 font-medium">Total: {formData.currency} {item.total_price.toLocaleString()}</span>
                </div>
                <div className="md:col-span-1 flex items-end justify-end h-full pb-3"> {/* Adjusted for alignment */}
                    {formData.items.length > 1 && (
                        <Button type="button" onClick={() => removeItem(index)} variant="danger" className="text-xs !py-1 !px-2">Remove</Button>
                    )}
                </div>
            </div>
            ))}
            <Button type="button" onClick={addItem} variant="secondary" className="mt-2">
                + Add Item
            </Button>
        </fieldset>

        <div className="grid md:grid-cols-3 gap-x-6 gap-y-4 items-start">
            <fieldset className="border p-4 rounded-md shadow-sm md:col-span-1 space-y-4">
                <legend className="text-xl font-semibold text-blue-700 px-2 mb-2">Settings</legend>
                <Select label="Tax Rate" id="tax_rate" name="tax_rate" value={formData.tax_rate} onChange={(e) => handleSelectChange('tax_rate', parseFloat(e.target.value))} options={vatRateOptions} required />
                <Select label="Template" id="template_id" name="template_id" value={formData.template_id} onChange={(e) => handleSelectChange('template_id', e.target.value)} options={templateOptions} />
                <div>
                    <label htmlFor="color_scheme" className="block text-sm font-medium text-gray-700 mb-1">Brand Color</label>
                    <input type="color" name="color_scheme" id="color_scheme" value={formData.color_scheme} onChange={handleInputChange} className="mt-1 block w-full h-10 px-1 py-1 border border-gray-300 rounded-md shadow-sm"/>
                </div>
                <Input label="Logo URL (Optional)" id="logo_url" name="logo_url" type="url" value={formData.logo_url} onChange={handleInputChange} placeholder="https://example.com/logo.png"/>
            </fieldset>

            <div className="md:col-span-2 p-6 space-y-3 bg-gray-50 rounded-lg shadow">
                <div className="flex justify-between text-lg font-medium text-gray-700"><span>Subtotal:</span> <span className="font-semibold">{formData.currency} {formData.subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-lg font-medium text-gray-700"><span>Tax ({ (formData.tax_rate * 100).toFixed(1) }%):</span> <span className="font-semibold">{formData.currency} {formData.tax_amount.toLocaleString()}</span></div>
                <hr className="my-2 border-gray-300"/>
                <div className="flex justify-between text-2xl font-bold" style={{color: formData.color_scheme || '#4A90E2'}}><span>Total Amount:</span> <span>{formData.currency} {formData.total_amount.toLocaleString()}</span></div>
            </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes / Terms & Conditions</label>
          <textarea name="notes" id="notes" value={formData.notes} onChange={handleInputChange} rows="4" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500" placeholder="E.g., Payment due within 30 days. Thank you for your business!"></textarea>
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-6 border-t mt-6">
          <Button type="button" variant="neutral" /*onClick={() => navigate('/invoices')}*/>
            Cancel
          </Button>
          <Button type="button" variant="secondary" onClick={() => handleSave('draft')}>
            Save as Draft
          </Button>
          <Button type="submit" variant="primary" style={{backgroundColor: formData.color_scheme || '#4A90E2'}}>
            {/* {isEditMode ? 'Save Changes' : 'Save and Send'} */}
            Save and Send (Placeholder)
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateEditInvoicePage;

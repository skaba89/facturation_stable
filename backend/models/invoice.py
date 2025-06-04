from datetime import datetime, date

# Predefined list of allowed VAT rates
# This can be expanded or made configurable per region/country later.
ALLOWED_VAT_RATES = [0.00, 0.05, 0.055, 0.10, 0.18, 0.20, 0.30] # Added 0.18 for WAEMU default

# Note on "TVA non applicable" mention:
# If tax_rate is 0.00, a legal mention might be required on the invoice PDF.
# For France: "TVA non applicable, art. 293B du CGI" (for micro-entrepreneurs).
# This logic would typically be handled during PDF generation or when displaying the invoice,
# potentially based on user's country and tax status (not yet in User model).
# A `vat_exemption_reason` field could be added to the Invoice model if different reasons exist.

class InvoiceLineItem:
    def __init__(self, description, quantity, unit_price):
        self.description = description
        self.quantity = quantity
        self.unit_price = unit_price # This is HT (Hors Taxe - Before Tax)
        self.total_price = quantity * unit_price # This is also HT (Hors Taxe - Before Tax)

    def __repr__(self):
        return f"<InvoiceLineItem '{self.description[:20]}...' Qty: {self.quantity} Unit Price (HT): {self.unit_price} Total (HT): {self.total_price}>"

class Invoice:
    def __init__(
        self,
        id,
        user_id,
        invoice_number,
        issue_date,
        due_date,
        items, # List of InvoiceLineItem objects
        currency,
        status='draft',
        client_id=None, # Placeholder, to be replaced by actual FK
        client_name=None, # Placeholder if client_id is not used initially
        client_address=None, # Placeholder
        tax_rate=0.0, # Document-level tax rate
        notes="",
    ):
        self.id = id
        self.user_id = user_id # Foreign Key to User model
        self.client_id = client_id # Foreign Key to a Client model (to be defined)
        self.client_name = client_name # Temporary if no Client model yet
        self.client_address = client_address # Temporary

        self.invoice_number = invoice_number # Needs generation logic (e.g., "INV-2023-001")
        self.issue_date = issue_date if isinstance(issue_date, date) else date.fromisoformat(str(issue_date))
        self.due_date = due_date if isinstance(due_date, date) else date.fromisoformat(str(due_date))

        self.items = items if items else [] # List of InvoiceLineItem objects, prices are HT

        # Validate and set tax_rate
        if tax_rate not in ALLOWED_VAT_RATES:
            # In a real application, this might raise a ValueError or default to a standard rate.
            # For now, let's print a warning and use 0.0 as a fallback for conceptual clarity.
            print(f"Warning: Provided tax_rate {tax_rate} is not in ALLOWED_VAT_RATES. Defaulting to 0.00.")
            self.tax_rate = 0.00
        else:
            self.tax_rate = tax_rate

        self.subtotal = self._calculate_subtotal() # Sum of HT item totals
        self.tax_amount = self._calculate_tax_amount() # Based on subtotal and tax_rate
        self.total_amount = self.subtotal + self.tax_amount # Total TTC (Toutes Taxes Comprises - All Taxes Included)

        self.currency = currency # e.g., "USD", "EUR", "XOF"
        self.status = status # Overall status: 'draft', 'sent', 'paid', 'overdue', 'cancelled', 'payment_pending', 'payment_failed'
        self.notes = notes

        # Payment-specific fields
        self.payment_method = None # e.g., 'orangemoney', 'stripe', 'manual_transfer'
        self.payment_transaction_id = None # ID from the payment gateway
        self.payment_status = None # Gateway-specific status: e.g., 'pending', 'successful', 'failed', 'expired', 'pending_orangemoney'
        # Note: `Invoice.status` would be 'paid' when `payment_status` is 'successful'.
        # `Invoice.status` could be 'payment_pending' or 'payment_failed' to reflect ongoing or failed attempts.

        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def set_payment_details(self, method, transaction_id, payment_status):
        """Helper to set payment related fields and update timestamp."""
        self.payment_method = method
        self.payment_transaction_id = transaction_id
        self.payment_status = payment_status
        self.updated_at = datetime.utcnow()

    def _calculate_subtotal(self):
        """Calculates subtotal from HT line item totals."""
        return sum(item.total_price for item in self.items)

    def _calculate_tax_amount(self):
        """Calculates tax amount based on subtotal and the document-level tax_rate."""
        return self.subtotal * self.tax_rate

    def update_totals(self, new_tax_rate=None):
        """
        Recalculates subtotal, tax_amount, and total_amount.
        Optionally updates the tax_rate if a valid new_tax_rate is provided.
        Call after modifying items or when changing the tax_rate.
        """
        if new_tax_rate is not None:
            if new_tax_rate in ALLOWED_VAT_RATES:
                self.tax_rate = new_tax_rate
            else:
                # Handle invalid new_tax_rate, e.g., raise error or log warning
                # For now, keeping existing tax_rate if new one is invalid
                print(f"Warning: Attempted to update with invalid tax_rate {new_tax_rate}. Keeping current rate: {self.tax_rate}")

        self.subtotal = self._calculate_subtotal() # Always recalculate subtotal from items
        self.tax_amount = self._calculate_tax_amount() # Recalculate tax based on current/new subtotal and tax_rate
        self.total_amount = self.subtotal + self.tax_amount
        self.updated_at = datetime.utcnow()

    def add_item(self, description, quantity, unit_price):
        """Adds a new line item. unit_price is HT."""
        item = InvoiceLineItem(description, quantity, unit_price)
        self.items.append(item)
        self.update_totals() # Recalculate all totals

    def remove_item(self, item_index):
        if 0 <= item_index < len(self.items):
            del self.items[item_index]
            self.update_totals() # Recalculate all totals

    def __repr__(self):
        return f"<Invoice {self.invoice_number} Subtotal (HT): {self.subtotal} Tax Rate: {self.tax_rate*100}% Tax: {self.tax_amount} Total (TTC): {self.total_amount} {self.currency} Status: {self.status}>"


# Example Usage (Conceptual):
# from datetime import date, timedelta
#
# item1 = InvoiceLineItem(description="Web Development Services (HT)", quantity=10, unit_price=50) # 500 HT
# item2 = InvoiceLineItem(description="Consulting Hours (HT)", quantity=5, unit_price=100) # 500 HT
#
# # Invoice with 20% VAT
# new_invoice = Invoice(
#     id=1,
#     user_id=101,
#     client_name="Client A",
#     client_address="123 Main St, Anytown",
#     invoice_number="INV-2024-001",
#     issue_date=date.today(),
#     due_date=date.today() + timedelta(days=30),
#     items=[item1, item2],
#     currency="EUR",
#     tax_rate=0.20, # 20% VAT
#     status="draft",
#     notes="Thank you for your business!"
# )
# # Expected: Subtotal = 1000, Tax Amount = 200, Total Amount = 1200
# print(new_invoice)
#
# # Invoice with 0% VAT (e.g., TVA non applicable)
# zero_vat_invoice = Invoice(
#     id=2,
#     user_id=102,
#     client_name="Client B",
#     invoice_number="INV-2024-002",
#     issue_date=date.today(),
#     due_date=date.today() + timedelta(days=30),
#     items=[InvoiceLineItem("Exported Goods", 1, 1000)],
#     currency="USD",
#     tax_rate=0.00, # 0% VAT
#     status="draft"
# )
# # Expected: Subtotal = 1000, Tax Amount = 0, Total Amount = 1000
# print(zero_vat_invoice)
#
# # Invoice with an invalid VAT rate (should default to 0% based on current logic or raise error)
# invalid_vat_invoice = Invoice(
#     id=3,
#     user_id=103,
#     client_name="Client C",
#     invoice_number="INV-2024-003",
#     issue_date=date.today(),
#     due_date=date.today() + timedelta(days=30),
#     items=[InvoiceLineItem("Services", 1, 100)],
#     currency="EUR",
#     tax_rate=0.123, # Invalid rate
#     status="draft"
# )
# print(invalid_vat_invoice) # Should show tax_rate as 0.00 and calculated totals accordingly
#
# # Test updating totals with a new valid tax rate
# new_invoice.update_totals(new_tax_rate=0.10) # Change VAT from 20% to 10%
# # Expected: Subtotal = 1000, Tax Amount = 100, Total Amount = 1100
# print(f"After VAT rate change: {new_invoice}")
#
# # Test adding an item
# new_invoice.add_item("Additional Service (HT)", 1, 200) # 200 HT added
# # Expected new subtotal: 1000 + 200 = 1200. With 10% VAT: Tax = 120, Total = 1320
# print(f"After adding item: {new_invoice}")

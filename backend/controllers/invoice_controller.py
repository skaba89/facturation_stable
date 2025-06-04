# Conceptual Implementation for Invoice CRUD API Endpoints
# Assumes integration with a web framework (e.g., Flask, Django, FastAPI)
# and use of models from backend.models.invoice (e.g., ALLOWED_VAT_RATES).

# Important Considerations:
# 1. Input Validation: All incoming data must be validated (e.g., data types, required fields, formats).
#    - `tax_rate` must be one of the `ALLOWED_VAT_RATES` from `invoice.py`.
# 2. Authorization:
#    - Users should only be able to access/modify their own invoices unless they have specific roles (e.g., accountant, admin).
#    - RBAC (Role-Based Access Control) checks from `rbac_service.py` should be integrated.
# 3. Error Handling: Consistent error responses should be provided.
# 4. Database Interaction: These conceptual functions would interact with a database layer.
# 5. Invoice Number Generation: Logic for generating unique invoice numbers is needed.
# 6. Client Management: `client_id` would ideally link to a separate `Clients` table/model.
# 7. "TVA non applicable" mention:
#    - If `tax_rate` is 0.00, the system might need to generate a specific legal mention on the final invoice PDF
#      (e.g., "TVA non applicable, art. 293B du CGI" for France). This depends on the user's country
#      and tax status. This logic is typically part of the PDF generation/presentation layer.

# --- API Endpoints ---

# 1. Create a New Invoice
# Endpoint: POST /api/invoices
# Description: Creates a new invoice.
# Request Payload (JSON):
# {
#   "client_id": "client_uuid_or_id", # Or "client_name", "client_address"
#   "client_name": "Example Client Inc.",
#   "client_address": "456 Business Rd, Suite 789, Cityville",
#   "issue_date": "2024-07-31", # ISO format YYYY-MM-DD
#   "due_date": "2024-08-30",   # ISO format YYYY-MM-DD
#   "items": [ # Item prices are HT (before tax)
#     {"description": "Product A (HT)", "quantity": 2, "unit_price": 50.00}, # total_price HT = 100.00
#     {"description": "Service B (HT)", "quantity": 1, "unit_price": 200.00} # total_price HT = 200.00
#   ],
#   "currency": "USD", # "XOF", "EUR"
#   "tax_rate": 0.08,  # 8%. Must be one of ALLOWED_VAT_RATES.
#   "notes": "Payment due within 30 days.",
#   "status": "draft" # Optional, defaults to 'draft'
# }
# Conceptual Logic during creation:
# - Sum of `item.total_price` gives `subtotal` (e.g., 100.00 + 200.00 = 300.00 HT).
# - `tax_amount` = `subtotal` * `tax_rate` (e.g., 300.00 * 0.08 = 24.00).
# - `total_amount` = `subtotal` + `tax_amount` (e.g., 300.00 + 24.00 = 324.00 TTC).
# Response Payload (Success - 201 Created):
# {
#   "invoice_id": "new_invoice_uuid_or_id",
#   "user_id": "creator_user_id",
#   "invoice_number": "INV-2024-001", # Generated invoice number
#   "subtotal": 300.00,
#   "tax_rate": 0.08,
#   "tax_amount": 24.00,
#   "total_amount": 324.00,
#   "currency": "USD",
#   "status": "draft",
#   "message": "Invoice created successfully."
#   # ... other relevant fields from the created invoice
# }
# Response Payload (Error - 400 Bad Request):
# { "error": "Invalid input data. Missing required fields, incorrect formats, or invalid tax_rate." }
# Response Payload (Error - 403 Forbidden):
# { "error": "You do not have permission to create invoices." }

# 2. List All Invoices (for the authenticated user)
# Endpoint: GET /api/invoices
# Description: Retrieves a list of invoices for the authenticated user.
#             Supports filtering (e.g., by status, client, date range) and pagination.
# Query Parameters (Optional):
#   - `status` (e.g., 'draft', 'sent', 'paid')
#   - `client_id`
#   - `date_from`, `date_to`
#   - `page` (for pagination)
#   - `limit` (for pagination)
# Response Payload (Success - 200 OK):
# {
#   "data": [
#     {
#       "invoice_id": "inv_id_1",
#       "invoice_number": "INV-2024-001",
#       "client_name": "Client A",
#       "issue_date": "2024-07-15",
#       "due_date": "2024-08-14",
#       "total_amount": 162.00, # Example total TTC
#       "currency": "USD",
#       "status": "sent"
#     },
#     {
#       "invoice_id": "inv_id_2",
#       "invoice_number": "INV-2024-002",
#       "client_name": "Client B",
#       "issue_date": "2024-07-20",
#       "due_date": "2024-08-19",
#       "total_amount": 300.00, # Example total TTC
#       "currency": "XOF",
#       "status": "paid"
#     }
#   ],
#   "pagination": {
#     "total_items": 50,
#     "total_pages": 5,
#     "current_page": 1,
#     "page_size": 10
#   }
# }
# Response Payload (Error - 403 Forbidden):
# { "error": "You do not have permission to view these invoices." }


# 3. Get a Specific Invoice
# Endpoint: GET /api/invoices/{invoice_id}
# Description: Retrieves details of a specific invoice.
# Response Payload (Success - 200 OK):
# {
#   "invoice_id": "inv_id_1",
#   "user_id": "creator_user_id",
#   "invoice_number": "INV-2024-001",
#   "client_name": "Client A",
#   "client_address": "123 Main St",
#   "issue_date": "2024-07-15",
#   "due_date": "2024-08-14",
#   "items": [ # Item prices are HT
#     {"description": "Item 1 (HT)", "quantity": 1, "unit_price": 100.00, "total_price": 100.00}
#   ],
#   "subtotal": 100.00, # Sum of HT item totals
#   "tax_rate": 0.10,   # Document-level tax rate applied
#   "tax_amount": 10.00, # subtotal * tax_rate
#   "total_amount": 110.00, # subtotal + tax_amount (TTC)
#   "currency": "USD",
#   "status": "sent",
#   "notes": "Thanks!",
#   "created_at": "2024-07-15T10:00:00Z",
#   "updated_at": "2024-07-15T10:00:00Z"
# }
# Response Payload (Error - 403 Forbidden):
# { "error": "You do not have permission to view this invoice." }
# Response Payload (Error - 404 Not Found):
# { "error": "Invoice not found." }

# 4. Update an Existing Invoice
# Endpoint: PUT /api/invoices/{invoice_id}
# Description: Updates an existing invoice. Only certain fields might be updatable depending on status (e.g., a 'paid' invoice might be locked).
# Request Payload (JSON): Contains fields to be updated.
# {
#   "client_name": "Updated Client A",
#   "due_date": "2024-08-20",
#   "items": [ # Item prices are HT
#     {"description": "Item 1 (updated HT)", "quantity": 1, "unit_price": 120.00}
#   ],
#   "tax_rate": 0.05, # Optional: if changing tax rate. Must be one of ALLOWED_VAT_RATES.
#   "notes": "Updated payment terms.",
#   "status": "draft" # Potentially
# }
# Conceptual Logic during update:
# - If `items` are changed, `subtotal` is recalculated from new item HT totals.
# - If `tax_rate` is changed (and valid), it's updated.
# - `tax_amount` = new `subtotal` * new or existing `tax_rate`.
# - `total_amount` = new `subtotal` + new `tax_amount`.
# Response Payload (Success - 200 OK):
# {
#   "invoice_id": "inv_id_1",
#   "message": "Invoice updated successfully.",
#   "subtotal": 120.00,
#   "tax_rate": 0.05,
#   "tax_amount": 6.00,
#   "total_amount": 126.00,
#   # ... other relevant fields from the updated invoice
# }
# Response Payload (Error - 400 Bad Request):
# { "error": "Invalid input data or invalid tax_rate." }
# Response Payload (Error - 403 Forbidden):
# { "error": "You do not have permission to update this invoice." }
# Response Payload (Error - 404 Not Found):
# { "error": "Invoice not found." }
# Response Payload (Error - 409 Conflict):
# { "error": "Cannot update invoice in its current state (e.g., if paid)." }

# 5. Delete an Invoice
# Endpoint: DELETE /api/invoices/{invoice_id}
# Description: Deletes an invoice (soft delete is often preferred over hard delete).
# Response Payload (Success - 200 OK or 204 No Content):
# { "message": "Invoice deleted successfully." }
# Response Payload (Error - 403 Forbidden):
# { "error": "You do not have permission to delete this invoice." }
# Response Payload (Error - 404 Not Found):
# { "error": "Invoice not found." }
# Response Payload (Error - 409 Conflict):
# { "error": "Cannot delete invoice in its current state (e.g., if paid or part of an audit trail)." }

# --- Placeholder Functions (to be implemented with a framework) ---

def create_invoice_handler(request_data, user_id):
    # 1. Validate input_data (using a schema validator like Pydantic or Marshmallow)
    # 2. Check permissions (e.g., rbac_service.check_permission(user.role, PERMISSIONS["CREATE_INVOICE"]))
    # 3. Generate invoice_number
    # 4. Create InvoiceLineItem objects from request_data.items
    # 5. Create Invoice object (from models.invoice)
    # 6. Save to database
    # 7. Return response
    pass

def list_invoices_handler(user_id, query_params):
    # 1. Check permissions (e.g., rbac_service.check_permission(user.role, PERMISSIONS["VIEW_OWN_INVOICES"]))
    #    Accountants/Admins might have PERMISSIONS["VIEW_ALL_INVOICES"]
    # 2. Construct database query based on user_id and query_params (filters, pagination)
    # 3. Fetch invoices from database
    # 4. Format response
    pass

def get_invoice_handler(invoice_id, user_id):
    # 1. Fetch invoice from database by invoice_id
    # 2. If not found, return 404
    # 3. Check ownership or specific view permissions (e.g., user_id matches invoice.user_id OR rbac allows viewing all)
    #    if not (invoice.user_id == user_id or rbac_service.check_permission(user.role, PERMISSIONS["VIEW_ALL_INVOICES"])):
    #        return {"error": "Forbidden"}, 403
    # 4. Format and return response
    pass

def update_invoice_handler(invoice_id, request_data, user_id):
    # 1. Fetch invoice from database
    # 2. If not found, return 404
    # 3. Check ownership and permissions
    # 4. Validate input_data
    # 5. Check if invoice status allows updates (e.g., not 'paid' or 'cancelled')
    # 6. Update invoice fields, recalculate totals if items change
    # 7. Save to database
    # 8. Format and return response
    pass

def delete_invoice_handler(invoice_id, user_id):
    # 1. Fetch invoice from database
    # 2. If not found, return 404
    # 3. Check ownership and permissions
    # 4. Check if invoice status allows deletion (e.g., not 'paid')
    # 5. Perform soft delete (e.g., set status to 'deleted' or mark is_deleted=True) or hard delete
    # 6. Return success response
    pass

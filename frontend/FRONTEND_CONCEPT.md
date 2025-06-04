# Frontend Conceptual Outline (React.js/Next.js + Tailwind CSS)

This document outlines the conceptual structure, components, pages, and styling for the frontend of the invoicing application, aiming to emulate the modern and user-friendly UI/UX of services like Tiime.

## 1. Project Setup

*   **Framework:** Next.js (React framework)
*   **Styling:** Tailwind CSS
*   **Initialization:** Typically started with `npx create-next-app@latest --typescript` (or JavaScript) and then [Tailwind CSS configured](https://tailwindcss.com/docs/guides/nextjs).
*   **Core Folder Structure within `frontend/`:**
    *   `components/`: Reusable UI components (Buttons, Inputs, Cards, etc.).
        *   `ui/`: General-purpose UI elements (Button, Input, Modal).
        *   `layout/`: Components like Navbar, Sidebar, Footer.
        *   `feature/`: Components specific to features (e.g., `InvoiceForm`, `InvoiceListItem`).
    *   `pages/`: Next.js page routes (e.g., `auth/login.js`, `invoices/index.js`).
        *   `api/`: Next.js API routes (if any frontend-specific API handling is needed, though most will be backend).
    *   `styles/`: Global styles, Tailwind base configurations (`globals.css`).
    *   `services/`: API interaction layer (e.g., `api.js` or feature-specific services like `invoiceService.js`).
    *   `utils/`: Utility functions (formatters, validators, hooks).
    *   `hooks/`: Custom React hooks (e.g., `useAuth`, `useForm`).
    *   `contexts/` or `store/`: For state management (e.g., React Context, Zustand, Redux Toolkit).
    *   `public/`: Static assets like images, fonts.
    *   `constants/`: Application-wide constants (e.g., API base URL, route paths).

## 2. Core UI Components (Conceptual)

These components would be built using HTML and styled with Tailwind CSS, located in `frontend/components/ui/` or `frontend/components/layout/`.

*   **`Button`**:
    *   Variants: `primary` (e.g., brand color), `secondary` (e.g., gray), `danger` (e.g., red).
    *   Sizes: `small`, `medium`, `large`.
    *   States: `default`, `hover`, `focus`, `disabled`.
    *   Props: `onClick`, `type`, `children`, `variant`, `size`, `isLoading`.
*   **`Input`**:
    *   Types: `text`, `email`, `password`, `number`, `date`.
    *   Props: `label`, `placeholder`, `value`, `onChange`, `error`, `type`, `name`.
    *   Styled for clarity, with focus states and error handling display.
*   **`Card`**:
    *   A container with padding, shadow, and rounded corners for displaying blocks of information or forms.
    *   Props: `title`, `children`, `className`.
*   **`Navbar`**:
    *   Main application navigation, typically at the top.
    *   Links to key areas (Dashboard, Invoices, Clients, Settings).
    *   User profile dropdown (Logout, Profile).
    *   Logo.
*   **`Sidebar`**: (If a dashboard layout is chosen)
    *   Vertical navigation for dashboard sections.
    *   Collapsible option.
*   **`Table`**:
    *   For displaying lists of data (invoices, clients).
    *   Props: `columns` (definitions), `data` (array).
    *   Features: Sortable headers, pagination (could be a separate component), action buttons/icons per row.
    *   Styled for readability.
*   **`Modal`**:
    *   For pop-up forms (e.g., Create Invoice, Confirm Delete) or information.
    *   Props: `isOpen`, `onClose`, `title`, `children`, `footerContent`.
    *   Overlay background.
*   **`SelectDropdown`**:
    *   Customizable select component.
    *   Props: `label`, `options` (array of `{value, label}`), `value`, `onChange`, `placeholder`, `error`.
*   **`DatePicker`**:
    *   A wrapper around a library like `react-datepicker` styled with Tailwind.
*   **`LineItemInput`**: (Specific to Invoice form)
    *   A component for a single line item, including fields for description, quantity, unit price, and total.
    *   Delete button for the line item.

## 3. Pages and their Key Elements (Conceptual)

Located in `frontend/pages/`.

### a. Authentication

*   **Registration Page (`pages/auth/register.js`):**
    *   Layout: Centered form on the page.
    *   Components: `Card`, `Input` (for email, password, confirm password), `SelectDropdown` (for profile type: 'freelance', 'accountant', 'sme', 'large_enterprise'), `Button` ("Register").
    *   Functionality: Form validation, API call to `POST /api/auth/register`.
    *   Navigation: Link to Login page.
*   **Login Page (`pages/auth/login.js`):**
    *   Layout: Centered form on the page.
    *   Components: `Card`, `Input` (for email, password), `Button` ("Login").
    *   Functionality: Form validation, API call to `POST /api/auth/login`, store auth token, redirect to dashboard.
    *   Navigation: Link to Registration page.

### b. Invoicing Module

*   **Dashboard/Invoices List Page (`pages/dashboard/invoices.js` or `pages/invoices/index.js`):**
    *   Protection: Requires authentication (redirect to login if not authenticated).
    *   Layout: `Navbar`, potentially `Sidebar`, main content area.
    *   Components: `Button` ("Create New Invoice"), `Table`.
    *   Table Columns: Invoice #, Client Name, Issue Date, Due Date, Total Amount, Status (e.g., Draft, Sent, Paid, Overdue - styled with badges).
    *   Table Row Actions: Icons or buttons for View, Edit, Delete (with confirmation modal).
    *   Filtering/Sorting: Dropdowns or input fields for filtering by status, client, date range. Clickable table headers for sorting.
    *   Data: Fetched from `GET /api/invoices`.
*   **Create Invoice Page (`pages/invoices/new.js`):**
    *   Protection: Requires authentication.
    *   Layout: `Navbar`, form-centric layout.
    *   Components: `Input` (client name, client address), `DatePicker` (issue date, due date), `LineItemInput` (for a dynamic list of items), `SelectDropdown` (VAT rate from `ALLOWED_VAT_RATES`), read-only fields for Subtotal, VAT Amount, Total Amount, `Textarea` (notes).
    *   Functionality:
        *   Dynamically add/remove line items.
        *   Automatic calculation of line item totals, subtotal, VAT amount, and grand total.
        *   Form validation.
        *   API call to `POST /api/invoices` on save.
    *   Buttons: "Save Draft", "Preview", "Send Invoice" (Send might be a later feature, for now, it could just change status to 'sent').
*   **Edit Invoice Page (`pages/invoices/[id]/edit.js`):**
    *   Protection: Requires authentication.
    *   Layout & Components: Similar to Create Invoice page, but populated with data from `GET /api/invoices/{invoice_id}`.
    *   Functionality: API call to `PUT /api/invoices/{invoice_id}` on save.
*   **View Invoice Page (`pages/invoices/[id]/view.js`):**
    *   Protection: Requires authentication.
    *   Layout: Clean, professional presentation of the invoice, resembling a final document. Not editable here.
    *   Data: Fetched from `GET /api/invoices/{invoice_id}`.
    *   Components: Display sections for all invoice details (seller info, client info, dates, line items table, totals, notes, status).
    *   Actions: `Button` ("Edit", "Download PDF" (conceptual), "Mark as Sent", "Record Payment" (manual), "Pay with Orange Money" (if applicable and unpaid)).

### c. Other Potential Pages

*   **Client Management Pages (`pages/clients/`)**
*   **User Profile/Settings Page (`pages/settings/profile.js`)**
*   **Account/Billing Page (`pages/settings/billing.js`)**

## 4. Styling and Responsiveness

*   **Tailwind CSS:** Primary styling method using utility classes. A `tailwind.config.js` file will define theme customizations (colors, fonts, spacing) to match Tiime's aesthetic (e.g., primary blue, clean sans-serif fonts).
*   **Global Styles (`styles/globals.css`):** For base HTML element styling, font imports, and any global overrides.
*   **Responsiveness:** All components and pages will be designed mobile-first or adaptively using Tailwind's responsive prefixes (e.g., `sm:`, `md:`, `lg:`). The goal is a seamless experience on all device sizes.
*   **UI/UX Goal:** Emulate Tiime's clean, modern, intuitive, and user-friendly interface. Focus on clarity, ease of use, and a professional but friendly aesthetic.

## 5. API Interaction & State Management

*   **Service Layer (`frontend/services/api.js` or feature-specific):**
    *   Centralized place for API call functions (using `fetch` or a library like `axios`).
    *   Functions like `loginUser(email, password)`, `registerUser(data)`, `getInvoices()`, `getInvoiceById(id)`, `createInvoice(data)`, `updateInvoice(id, data)`, `deleteInvoice(id)`.
    *   Handles adding auth tokens to headers, base URL configuration, and consistent error handling.
*   **State Management:**
    *   **Authentication:** User object, token, authentication status (e.g., `isLoading`, `isAuthenticated`). React Context or Zustand are good choices for this.
    *   **Fetched Data:** Server-side data, loading states, error states. React Query (TanStack Query) or SWR are excellent for managing server state (caching, refetching, etc.). Alternatively, a more general state management library can be used.
    *   **Form State:** Local component state (`useState`) or a form library like React Hook Form or Formik.
*   **Protected Routes:**
    *   A higher-order component (HOC) or a custom hook (`useAuth`) will be used to protect routes that require authentication. Unauthenticated users will be redirected to the login page.

This conceptual outline provides a foundational plan for the frontend development. Specific details will be refined as development progresses.

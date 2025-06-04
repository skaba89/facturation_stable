import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api'; // Backend API runs on port 3000

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add JWT token to requests
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Authentication API calls
export const registerUser = (userData) => apiClient.post('/auth/register', userData);
export const loginUser = (credentials) => apiClient.post('/auth/login', credentials);

// Invoice API calls
export const fetchInvoices = (params) => apiClient.get('/invoices', { params }); // params for pagination e.g. { page: 1, limit: 10 }
export const getInvoiceById = (id) => apiClient.get(`/invoices/${id}`);
export const createInvoice = (invoiceData) => apiClient.post('/invoices', invoiceData);
export const updateInvoice = (id, invoiceData) => apiClient.put(`/invoices/${id}`, invoiceData);
export const deleteInvoice = (id) => apiClient.delete(`/invoices/${id}`);

// Payment API calls
export const initiatePayment = (paymentData) => apiClient.post('/payments/initiate', paymentData);
export const checkPaymentStatus = (paymentId) => apiClient.get(`/payments/${paymentId}/status`);

// Utility API calls
export const getVatOptions = () => apiClient.get('/utils/vat-options');


// Function to store token (called on login)
export const storeToken = (token) => {
    localStorage.setItem('authToken', token);
};

// Function to remove token (called on logout)
export const removeToken = () => {
    localStorage.removeItem('authToken');
};

// Function to get current token
export const getToken = () => {
    return localStorage.getItem('authToken');
};

export default apiClient;

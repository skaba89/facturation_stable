import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // For link to registration page
import Input from '../components/Input';
import Button from '../components/Button';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
     // Basic validation clear on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid.';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Login data submitted:', formData);
      // Placeholder for API call:
      // authService.login(formData)
      //   .then(response => console.log('Login successful:', response))
      //   .catch(error => console.error('Login error:', error));
      alert('Login form submitted (placeholder) - check console.');
    } else {
      console.log('Form validation errors:', errors);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 shadow-2xl rounded-xl">
        <div>
          {/* Logo placeholder */}
           <div className="text-center">
             <svg className="mx-auto h-12 w-auto text-blue-600" /* Placeholder icon */ fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                create a new account
              </Link>
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <Input
            id="email"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="Your password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Remember me</label> */}
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </a>
            </div>
          </div>
          <div>
            <Button type="submit" fullWidth={true}>
              Sign In
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

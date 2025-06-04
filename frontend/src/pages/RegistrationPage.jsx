import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // For link to login page
import Input from '../components/Input';
import Button from '../components/Button';
import Select from '../components/Select';

const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    profileType: 'freelance', // Default value
  });

  const [errors, setErrors] = useState({});

  const profileTypeOptions = [
    { value: 'freelance', label: 'Freelance' },
    { value: 'sme', label: 'SME (Small/Medium Enterprise)' },
    { value: 'accountant', label: 'Accountant' },
    { value: 'large_enterprise', label: 'Large Enterprise' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Basic validation clear on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    if (name === "password" && errors.confirmPassword && value !== formData.confirmPassword) {
        // If password changes, re-validate confirmPassword if it had an error
    } else if (name === "confirmPassword" && errors.confirmPassword && value !== formData.password) {
        // If confirmPassword changes and it doesn't match password
    }

  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required.';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid.';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    if (!formData.profileType) newErrors.profileType = 'Profile type is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form data submitted:', formData);
      // Placeholder for API call:
      // authService.register(formData)
      //   .then(response => console.log('Registration successful:', response))
      //   .catch(error => console.error('Registration error:', error));
      alert('Registration form submitted (placeholder) - check console.');
    } else {
      console.log('Form validation errors:', errors);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 shadow-2xl rounded-xl">
        <div>
          {/* Logo placeholder - Tiime would have their logo here */}
          <div className="text-center">
             <svg className="mx-auto h-12 w-auto text-blue-600" /* Placeholder icon */ fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                sign in to your existing account
              </Link>
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <Input
            id="username"
            label="Username"
            type="text"
            placeholder="e.g., jeandupont"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
            required
          />
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
            placeholder="Minimum 8 characters"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
          />
          <Input
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
          />
          <Select
            id="profileType"
            label="I am a..."
            value={formData.profileType}
            onChange={handleChange}
            options={profileTypeOptions}
            error={errors.profileType}
            required
          />
          <div>
            <Button type="submit" fullWidth={true}>
              Create Account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationPage;

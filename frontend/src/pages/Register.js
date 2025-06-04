import React, { useState } from 'react';
import { registerUser } from '../services/api';
// import { useNavigate } from 'react-router-dom'; // For redirecting after registration

const RegisterPage = () => {
    // const navigate = useNavigate(); // Uncomment if using react-router-dom for navigation
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [profileType, setProfileType] = useState('freelance'); // Default profile type
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const response = await registerUser({ email, password, profile_type: profileType });
            setSuccess(response.data.message || 'Registration successful! Please login.');
            // navigate('/login'); // Uncomment to redirect to login page
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="8" />
                </div>
                <div>
                    <label htmlFor="profileType">Profile Type:</label>
                    <select id="profileType" value={profileType} onChange={(e) => setProfileType(e.target.value)}>
                        <option value="freelance">Freelance</option>
                        <option value="accountant">Accountant</option>
                        <option value="sme">SME (Small/Medium Enterprise)</option>
                        <option value="large_enterprise">Large Enterprise</option>
                    </select>
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default RegisterPage;

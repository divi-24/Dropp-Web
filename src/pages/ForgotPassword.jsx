import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import UserService from '../core/services/UserService';
import '../styles/Auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!email.trim()) {
            setError('Please enter your email address');
            return;
        }

        setLoading(true);
        try {
            const response = await UserService.requestResetPassword(email.trim());
            setSuccess(response?.message || 'Password reset link sent to your email.');
        } catch (err) {
            setError(err?.message || 'Unable to send reset link. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Reset <span className="auth-accent">password.</span></h1>
                    <p>Enter your account email to receive a reset link.</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="auth-error">{error}</div>}
                    {success && <div className="auth-success">{success}</div>}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            disabled={loading}
                            autoComplete="email"
                        />
                    </div>

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? <span className="loading-spinner"></span> : 'Send Reset Link'}
                    </button>

                    <div className="auth-footer">
                        <p>
                            Remember your password? <Link className="auth-link" to="/login">Sign in</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;

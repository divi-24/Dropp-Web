import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import UserService from '../core/services/UserService';
import '../styles/Auth.css';

const VerifyEmailToken = () => {
    const { token } = useParams();
    const [searchParams] = useSearchParams();
    const resolvedToken = token || searchParams.get('token');
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        let mounted = true;
        const verify = async () => {
            if (!resolvedToken) {
                setStatus('error');
                setMessage('Invalid verification link.');
                return;
            }
            try {
                const response = await UserService.verifyEmailToken(resolvedToken);
                if (!mounted) return;
                setStatus('success');
                setMessage(response?.status || response?.message || 'Email verified successfully.');
            } catch (err) {
                if (!mounted) return;
                setStatus('error');
                setMessage(err?.message || 'Verification failed or link expired.');
            }
        };

        verify();
        return () => { mounted = false; };
    }, [resolvedToken]);

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Email <span className="auth-accent">verification.</span></h1>
                </div>
                <div className="auth-form">
                    {status === 'loading' && <div className="auth-info">{message}</div>}
                    {status === 'success' && <div className="auth-success">{message}</div>}
                    {status === 'error' && <div className="auth-error">{message}</div>}
                    <div className="auth-footer">
                        <p>
                            <Link className="auth-link" to="/login">Go to login</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailToken;

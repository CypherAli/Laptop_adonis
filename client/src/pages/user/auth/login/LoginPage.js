import React, { useState, useContext } from 'react';
import AuthContext from '../../../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../../../components/common/Toast';
import '../styles/AuthPages.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const toast = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const response = await login(email, password);
            
            // Show warning if partner not approved
            if (response?.warning) {
                toast.warning(response.warning);
            } else {
                toast.success('Login successful!');
            }
            
            // Redirect to intended page or home
            const redirectPath = localStorage.getItem('redirectAfterLogin') || '/';
            localStorage.removeItem('redirectAfterLogin');
            setTimeout(() => navigate(redirectPath), 500);
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Login failed. Please check your email and password.';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-left">
                    <div className="auth-brand">
                        <div className="brand-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor" style={{width: '64px', height: '64px'}}>
                                <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                                <rect x="5" y="14" width="14" height="2" rx="1"/>
                            </svg>
                        </div>
                        <h1>Shoe Store</h1>
                        <p>Premium shoe marketplace platform</p>
                    </div>
                    <div className="auth-illustration">
                        <div className="floating-laptop">
                            <svg className="laptop-emoji" viewBox="0 0 64 64" fill="currentColor">
                                <rect x="8" y="12" width="48" height="32" rx="2" fill="#667eea" opacity="0.2"/>
                                <rect x="10" y="14" width="44" height="28" rx="1" fill="white"/>
                                <rect x="6" y="44" width="52" height="4" rx="2" fill="#667eea"/>
                                <rect x="28" y="45" width="8" height="2" fill="white" opacity="0.5"/>
                            </svg>
                        </div>
                        <div className="floating-circle circle-1"></div>
                        <div className="floating-circle circle-2"></div>
                        <div className="floating-circle circle-3"></div>
                    </div>
                </div>

                <div className="auth-right">
                    <div className="auth-form-wrapper">
                        <div className="auth-header">
                            <h2>Login</h2>
                            <p>Welcome back! Please login to your account.</p>
                        </div>

                        {error && (
                            <div className="error-alert">
                                <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" className="error-icon">
                                    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{marginRight: '6px', verticalAlign: 'middle'}}>
                                        <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555ZM0 4.697v7.104l5.803-3.558L0 4.697ZM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757Zm3.436-.586L16 11.801V4.697l-5.803 3.546Z"/>
                                    </svg>
                                    Email
                                </label>
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    placeholder="ten@email.com"
                                    required 
                                    disabled={loading}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{marginRight: '6px', verticalAlign: 'middle'}}>
                                        <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                                    </svg>
                                    Password
                                </label>
                                <div className="password-input-wrapper">
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        placeholder="••••••••"
                                        required 
                                        disabled={loading}
                                        className="form-input"
                                    />
                                    <button 
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? (
                                            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                                                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                                                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                                            </svg>
                                        ) : (
                                            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                                                <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z"/>
                                                <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12-.708.708z"/>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="form-options">
                                <Link to="/forgot-password" className="forgot-password-link">
                                    Forgot password?
                                </Link>
                            </div>

                            <button 
                                type="submit" 
                                className={`auth-submit-btn ${loading ? 'loading' : ''}`}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="btn-spinner"></span>
                                        <span>Logging in...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Login</span>
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                            <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="auth-divider">
                            <span>Or</span>
                        </div>

                        <div className="auth-footer">
                            <p>
                                Don't have an account? 
                                <Link to="/register" className="auth-link">Register now</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
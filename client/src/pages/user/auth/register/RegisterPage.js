import React, { useState, useContext } from 'react';
import AuthContext from '../../../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../../../components/common/Toast';
import '../styles/AuthPages.css';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('client');
    const [shopName, setShopName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const toast = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            const errorMsg = 'Passwords do not match!';
            setError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        if (password.length < 6) {
            const errorMsg = 'Password must be at least 6 characters.';
            setError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        if (role === 'partner' && !shopName.trim()) {
            const errorMsg = 'Please enter your shop name.';
            setError(errorMsg);
            toast.error(errorMsg);
            return;
        }

        setLoading(true);
        
        try {
            const userData = { username, email, password, role };
            if (role === 'partner') {
                userData.shopName = shopName;
            }
            await register(userData.username, userData.email, userData.password, userData.role, userData.shopName);
            toast.success('Registration successful! Please login.');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            const errorMsg = 'Registration failed. Email or username may already exist.';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-left" data-role={role}>
                    <div className="auth-brand">
                        <div className="brand-icon">�</div>
                        <h1>Shoe Store</h1>
                        <p>{role === 'partner' ? 'Start Selling Today!' : 'Join us today!'}</p>
                    </div>
                    <div className="auth-illustration">
                        <div className="floating-shoe">
                            <span className="shoe-emoji">👟</span>
                        </div>
                        <div className="floating-circle circle-1"></div>
                        <div className="floating-circle circle-2"></div>
                        <div className="floating-circle circle-3"></div>
                    </div>
                </div>

                <div className="auth-right">
                    <div className="auth-form-wrapper">
                        <div className="auth-header">
                            <h2>Register</h2>
                            <p>Create a new account to start shopping or selling.</p>
                        </div>

                        {error && (
                            <div className="error-alert">
                                <span className="error-icon">⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label>You are:</label>
                                <div className="register-role-select">
                                    <div 
                                        className={`role-option ${role === 'client' ? 'selected' : ''}`}
                                        data-role="client"
                                        onClick={() => setRole('client')}
                                    >
                                        <input 
                                            type="radio" 
                                            name="role" 
                                            value="client"
                                            checked={role === 'client'}
                                            onChange={(e) => setRole(e.target.value)}
                                        />
                                        <div className="role-icon">👤</div>
                                        <div className="role-name">Customer</div>
                                    </div>
                                    <div 
                                        className={`role-option ${role === 'partner' ? 'selected' : ''}`}
                                        data-role="partner"
                                        onClick={() => setRole('partner')}
                                    >
                                        <input 
                                            type="radio" 
                                            name="role" 
                                            value="partner"
                                            checked={role === 'partner'}
                                            onChange={(e) => setRole(e.target.value)}
                                        />
                                        <div className="role-icon">🏪</div>
                                        <div className="role-name">Partner Seller</div>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>👤 Username</label>
                                <input 
                                    type="text" 
                                    value={username} 
                                    onChange={(e) => setUsername(e.target.value)} 
                                    placeholder="johndoe"
                                    required 
                                    disabled={loading}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>📧 Email</label>
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    placeholder="you@example.com"
                                    required 
                                    disabled={loading}
                                    className="form-input"
                                />
                            </div>

                            {role === 'partner' && (
                                <div className="form-group">
                                    <label>🏪 Shop Name</label>
                                    <input 
                                        type="text" 
                                        value={shopName} 
                                        onChange={(e) => setShopName(e.target.value)} 
                                        placeholder="My Shoe Store"
                                        required 
                                        disabled={loading}
                                        className="form-input"
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label>🔒 Password</label>
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
                                    >
                                        {showPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>🔒 Confirm Password</label>
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword} 
                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                    placeholder="••••••••"
                                    required 
                                    disabled={loading}
                                    className="form-input"
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="auth-submit-btn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-small"></span>
                                        Registering...
                                    </>
                                ) : (
                                    <>
                                        <span>Register</span>
                                        <span>→</span>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="auth-divider">
                            <span>Or</span>
                        </div>

                        <div className="auth-footer">
                            <p>
                                Already have an account? 
                                <Link to="/login" className="auth-link">Login now</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
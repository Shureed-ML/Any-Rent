import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({
  email, setEmail,
  password, setPassword,
  handleLogin,
  message, error
}) => {
  const navigate = useNavigate();

  // Clear form fields when component unmounts
  useEffect(() => {
    return () => {
      setEmail('');
      setPassword('');
    };
  }, [setEmail, setPassword]);
  return (
    <section className="login-section animate-fade-in">
      <form onSubmit={handleLogin} className="login-form">
        <h2 className="login-title">Login</h2>
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="loginEmail" className="form-label">Email</label>
          <input
            type="email"
            id="loginEmail"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group mb-6">
          <label htmlFor="loginPassword" className="form-label">Password</label>
          <input
            type="password"
            id="loginPassword"
            className="form-input mb-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" className="submit-button">
          Login
        </button>
        
        <p className="register-link-section">
          Don't have an account? 
          <button 
            type="button" 
            onClick={() => navigate('/register')} 
            className="register-link"
          >
            Register here
          </button>
        </p>
      </form>
    </section>
  );
};

export default Login;
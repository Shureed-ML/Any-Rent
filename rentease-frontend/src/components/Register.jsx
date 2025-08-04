import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register = ({
  username, setUsername,
  email, setEmail,
  password, setPassword,
  handleRegister,
  message, error
}) => {
  const navigate = useNavigate();

  // Clear form fields when component unmounts
  useEffect(() => {
    return () => {
      setUsername('');
      setEmail('');
      setPassword('');
    };
  }, [setUsername, setEmail, setPassword]);
  return (
    <section className="animate-fade-in">
      <div className="register-section">
      <form onSubmit={handleRegister} className="register-form">
        <h2 className="register-title">Register</h2>
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="username" className="form-label">Username</label>
          <input
            type="text"
            id="username"
            className="form-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            id="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group mb-6">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            id="password"
            className="form-input mb-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" className="submit-button">
          Register
        </button>
        
        <p className="login-link-section">
          Already have an account? 
          <button 
            type="button" 
            onClick={() => navigate('/login')} 
            className="login-link"
          >
            Login here
          </button>
        </p>
      </form>
      </div>
    </section>
  );
};

export default Register;
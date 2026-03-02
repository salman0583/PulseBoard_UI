import { useState } from 'react';
import { Mail, User, Building, Phone, ArrowLeft, Zap } from 'lucide-react';
import '../styles/register.css';

type RegisterPageProps = {
  onRegisterSuccess: (email: string) => void;
  onBackToLogin: () => void;
};

export function RegisterPage({ onRegisterSuccess, onBackToLogin }: RegisterPageProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    phone: '',
    organization: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Registration failed');
      }

      onRegisterSuccess(formData.email);
    } catch (err) {
      alert('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="register-container">
      <div className="register-wrapper">
        <div className="register-logo-section">
          <div className="register-logo">
            <Zap />
          </div>
          <h1 className="register-title">Join PulseBoard</h1>
          <p className="register-subtitle">Create your account and start collaborating</p>
        </div>

        <div className="register-card">
          <button onClick={onBackToLogin} className="register-back-button">
            <ArrowLeft />
            Back to login
          </button>

          <form onSubmit={handleSubmit} className="register-form">
            <div className="register-form-grid">
              <div className="form-group">
                <label htmlFor="username">Username *</label>
                <div className="input-icon">
                  <User />
                  <input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                    placeholder="johndoe"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email address *</label>
                <div className="input-icon">
                  <Mail />
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="john@company.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="full_name">Full name</label>
                <input
                  id="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  placeholder="John Doe"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone number</label>
                <div className="input-icon">
                  <Phone />
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="organization">Organization</label>
                <div className="input-icon">
                  <Building />
                  <input
                    id="organization"
                    type="text"
                    value={formData.organization}
                    onChange={(e) => handleChange('organization', e.target.value)}
                    placeholder="Acme Inc."
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>

            <p className="register-terms">
              By creating an account, you agree to our{' '}
              <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}


/*jfkjdjgkldgnskjgnlgnjklgdnskl*/
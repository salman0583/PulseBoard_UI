import { useState } from 'react';
import { Mail, Zap } from 'lucide-react';
import { apiFetch } from '../api';
import '../styles/login.css';

type LoginPageProps = {
  onLoginRequest: (email: string) => void;
  onNavigateToRegister: () => void;
};

function LoginPage({ onLoginRequest, onNavigateToRegister }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiFetch('/api/request-otp/', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      onLoginRequest(email);
    } catch (err: any) {
      setError(err.message || 'Unable to send login code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-logo-section">
          <div className="login-logo">
            <Zap />
          </div>
          <h1 className="login-title">PulseBoard</h1>
          <p className="login-subtitle">Team collaboration, reimagined</p>
        </div>

        <div className="login-card">
          <h2>Welcome back</h2>
          <p className="login-card-subtitle">
            Enter your email to receive a login code
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Email address</label>
              <div className="input-icon">
                <Mail />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            {error && <p className="form-error">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              {loading ? 'Sending code...' : 'Send login code'}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Don&apos;t have an account?{' '}
              <button onClick={onNavigateToRegister} className="login-link">
                Sign up
              </button>
            </p>
          </div>
        </div>

        <p className="login-info-text">
          Secure OTP authentication • No passwords needed
        </p>
      </div>
    </div>
  );
}

export default LoginPage;

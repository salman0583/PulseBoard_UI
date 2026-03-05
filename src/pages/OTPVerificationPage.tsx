import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Zap } from 'lucide-react';
import { apiFetch } from '../api';
import '../styles/otp.css';

type OTPVerificationPageProps = {
  email: string;
  onVerified: () => void;
  onBack: () => void;
};

export function OTPVerificationPage({
  email,
  onVerified,
  onBack,
}: OTPVerificationPageProps) {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ Correctly typed refs
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const nextOtp = [...otp];
    nextOtp[index] = value;
    setOtp(nextOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await apiFetch('/api/verify-otp/', {
      method: 'POST',
      body: JSON.stringify({
        email,
        otp: otpCode,
      }),
    });
      // ✅ Login successful
      onVerified();
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="otp-container">
      <div className="otp-wrapper">
        <div className="otp-logo-section">
          <div className="otp-logo">
            <Zap />
          </div>
        </div>

        <div className="otp-card">
          <button onClick={onBack} className="back-button">
            <ArrowLeft /> Back
          </button>

          <h2>Enter verification code</h2>
          <p className="otp-card-subtitle">
            We sent a 6-digit code to <strong>{email}</strong>
          </p>

          <div className="otp-inputs-container">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                disabled={loading}
                className="otp-input"
              />
            ))}
          </div>

          {error && <p className="otp-error">{error}</p>}

          <button
            onClick={handleVerify}
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            {loading ? 'Verifying…' : 'Verify code'}
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  Shield,
  HelpCircle,
  Sparkles,
  Search,
  UserCheck,
} from 'lucide-react';
import bisLogo from '../assets/bis-logo.png';
import { useAuth } from '../state/AuthContext';
import { useTheme } from '../state/ThemeContext';
import { Button } from '../components/common/Button';
import { DEMO_USERS, DemoUser } from '../mocks/demoUsersData';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, loginWithGitHub, isAuthenticated, user, logout } = useAuth();
  const { resolvedTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [showForgotNotice, setShowForgotNotice] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoSearch, setDemoSearch] = useState('');
  const [demoRoleFilter, setDemoRoleFilter] = useState<'All' | 'Officer' | 'Industry Stakeholder' | 'Auditor'>('All');
  const [loadingProvider, setLoadingProvider] = useState<'email' | 'google' | 'github' | null>(null);

  const isSubmitting = loadingProvider !== null;

  // Return to intended page or default to assistant
  const from = (location.state as any)?.from?.pathname || '/assistant';

  const handleQuickDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setLoadingProvider('email');
    setFormError(null);
    setShowDemoModal(false);

    const result = await login(demoEmail, 'password123');
    setLoadingProvider(null);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setFormError(result.error || 'Authentication error');
    }
  };

  const validate = (): boolean => {
    let isValid = true;
    setEmailError(null);
    setPasswordError(null);
    setFormError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError('Please enter your email address.');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail) && !trimmedEmail.startsWith('BIS-')) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Please enter your password.');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must contain at least 6 characters.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    setLoadingProvider('email');
    setFormError(null);

    const result = await login(email.trim(), password);

    setLoadingProvider(null);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setFormError(result.error || 'Unable to sign in. Please check your credentials and try again.');
    }
  };

  const handleGoogleLogin = async () => {
    if (isSubmitting) return;
    setFormError(null);
    setLoadingProvider('google');

    const res = await loginWithGoogle();
    setLoadingProvider(null);

    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setFormError(res.error || 'Google sign-in could not be completed. Please try again.');
    }
  };

  const handleGitHubLogin = async () => {
    if (isSubmitting) return;
    setFormError(null);
    setLoadingProvider('github');

    const res = await loginWithGitHub();
    setLoadingProvider(null);

    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setFormError(res.error || 'GitHub sign-in could not be completed. Please try again.');
    }
  };

  if (isAuthenticated && user) {
    return (
      <div className="bis-login-page-container">
        <div className="bis-login-card bis-login-card--authenticated">
          <div className="bis-login-auth-header">
            <div className="bis-login-auth-avatar">
              <CheckCircle2 size={32} className="bis-login-check-icon" />
            </div>
            <h2 className="bis-login-title">Active BIS Session</h2>
            <p className="bis-login-subtitle">
              You are currently authenticated in the BIS Copilot Workspace.
            </p>
          </div>

          <div className="bis-login-profile-card">
            <div className="bis-profile-row">
              <span className="bis-profile-label">Authorized Account:</span>
              <strong className="bis-profile-val">{user.email}</strong>
            </div>
            <div className="bis-profile-row">
              <span className="bis-profile-label">Role:</span>
              <span className="bis-profile-val">{user.role}</span>
            </div>
            <div className="bis-profile-row">
              <span className="bis-profile-label">Organization:</span>
              <span className="bis-profile-val">{user.organization || 'Bureau of Indian Standards'}</span>
            </div>
          </div>

          <div className="bis-login-actions-row">
            <Button
              variant="outline"
              size="md"
              onClick={logout}
              className="bis-login-btn-flex"
            >
              Sign Out
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate(from, { replace: true })}
              className="bis-login-btn-flex"
            >
              Enter Workspace →
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bis-login-page-container">
      {/* Return navigation link */}
      <div className="bis-login-top-nav">
        <Link to="/assistant" className="bis-login-back-link">
          <ArrowLeft size={16} />
          <span>Back to BIS Copilot</span>
        </Link>
      </div>

      <div className="bis-login-card">
        {/* Brand identity header with Official BIS Logo */}
        <div className="bis-login-brand-header">
          <div className="bis-login-logo-wrap">
            <img
              src={bisLogo}
              alt="Bureau of Indian Standards"
              className="bis-login-logo-img"
            />
          </div>
          <div className="bis-login-titles">
            <h1 className="bis-login-app-title">BIS Copilot</h1>
            <span className="bis-login-app-tagline">Standards & Compliance Authority</span>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="bis-login-form-header">
          <h2 className="bis-login-welcome-title">Welcome back</h2>
          <p className="bis-login-welcome-subtitle">
            Your AI assistant for Indian Standards, compliance, certification and testing.
          </p>
        </div>

        {/* Global form error message */}
        {formError && (
          <div className="bis-login-alert-error" role="alert" aria-live="assertive">
            <AlertCircle size={18} className="bis-alert-error-icon" />
            <div className="bis-alert-error-text">
              <strong>Authentication Notice</strong>
              <p>{formError}</p>
            </div>
          </div>
        )}

        {/* Forgot password official guidance notice */}
        {showForgotNotice && (
          <div className="bis-login-alert-info" role="status">
            <HelpCircle size={18} className="bis-alert-info-icon" />
            <div className="bis-alert-info-text">
              <strong>Password Reset Information</strong>
              <p>
                Officer and industry user accounts are managed through the official{' '}
                <a
                  href="https://www.manakonline.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bis-login-info-link"
                >
                  Manakonline Portal
                </a>
                . Please use the statutory portal to reset your digital credentials.
              </p>
              <button
                type="button"
                className="bis-login-info-dismiss"
                onClick={() => setShowForgotNotice(false)}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Social Authentication Options */}
        <div className="bis-social-auth-group">
          {/* Continue with Google */}
          <button
            type="button"
            className="bis-social-btn bis-social-btn--google"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            aria-label="Continue with Google"
            id="bis-login-btn-google"
          >
            {loadingProvider === 'google' ? (
              <span className="bis-btn-loading-content">
                <Loader2 size={16} className="bis-spin-icon" />
                <span>Signing in...</span>
              </span>
            ) : (
              <>
                <svg className="bis-social-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Continue with GitHub */}
          <button
            type="button"
            className="bis-social-btn bis-social-btn--github"
            onClick={handleGitHubLogin}
            disabled={isSubmitting}
            aria-label="Continue with GitHub"
            id="bis-login-btn-github"
          >
            {loadingProvider === 'github' ? (
              <span className="bis-btn-loading-content">
                <Loader2 size={16} className="bis-spin-icon" />
                <span>Signing in...</span>
              </span>
            ) : (
              <>
                <svg className="bis-social-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
                <span>Continue with GitHub</span>
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="bis-auth-divider" role="separator" aria-label="Or sign in with email">
          <span className="bis-auth-divider-line" />
          <span className="bis-auth-divider-text">OR</span>
          <span className="bis-auth-divider-line" />
        </div>

        {/* Accessible Email & Password Login Form */}
        <form onSubmit={handleSubmit} noValidate className="bis-login-form">
          {/* Email / Officer ID */}
          <div className="bis-form-group">
            <label htmlFor="login-email" className="bis-form-label">
              Official Email or BIS ID
            </label>
            <div className="bis-input-icon-wrap">
              <Mail size={16} className="bis-field-icon" aria-hidden="true" />
              <input
                id="login-email"
                type="email"
                className={`bis-input bis-input-with-icon ${
                  emailError ? 'bis-input--error' : ''
                }`}
                placeholder="name@organization.gov.in"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                disabled={isSubmitting}
                autoComplete="email"
                aria-invalid={Boolean(emailError)}
                aria-describedby={emailError ? 'login-email-error' : undefined}
              />
            </div>
            {emailError && (
              <span id="login-email-error" className="bis-field-error-msg" role="alert">
                {emailError}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="bis-form-group">
            <label htmlFor="login-password" className="bis-form-label">
              Password
            </label>
            <div className="bis-input-icon-wrap">
              <Lock size={16} className="bis-field-icon" aria-hidden="true" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className={`bis-input bis-input-with-icon bis-input-with-toggle ${
                  passwordError ? 'bis-input--error' : ''
                }`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                disabled={isSubmitting}
                autoComplete="current-password"
                aria-invalid={Boolean(passwordError)}
                aria-describedby={passwordError ? 'login-password-error' : undefined}
              />
              <button
                type="button"
                className="bis-password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={0}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordError && (
              <span id="login-password-error" className="bis-field-error-msg" role="alert">
                {passwordError}
              </span>
            )}
          </div>

          {/* Remember Me Checkbox & Forgot Password */}
          <div className="bis-login-options-row">
            <label className="bis-checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="bis-checkbox-input"
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              className="bis-forgot-link"
              onClick={() => setShowForgotNotice(true)}
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="bis-login-submit-btn"
            id="bis-login-submit-btn"
            disabled={isSubmitting}
          >
            {loadingProvider === 'email' ? (
              <span className="bis-btn-loading-content">
                <Loader2 size={16} className="bis-spin-icon" />
                <span>Signing in...</span>
              </span>
            ) : (
              <span>Log in</span>
            )}
          </button>
        </form>

        {/* Instant Demo Access — 100 Verified Profiles */}
        <div className="bis-demo-profiles-container">
          <div className="bis-demo-profiles-header">
            <span className="bis-demo-badge">Instant Demo</span>
            <span className="bis-demo-title">Test with 100 Verified Profiles</span>
          </div>
          <div className="bis-demo-quick-grid">
            <button
              type="button"
              className="bis-demo-quick-btn"
              onClick={() => handleQuickDemoLogin('rajesh.sharma@bis.gov.in')}
              title="Log in as BIS QA Officer (HQ New Delhi)"
            >
              <span className="bis-demo-role-tag bis-role-officer">Officer</span>
              <strong>Rajesh Sharma</strong>
              <small>BIS HQ New Delhi</small>
            </button>
            <button
              type="button"
              className="bis-demo-quick-btn"
              onClick={() => handleQuickDemoLogin('a.bansal@aquapurewaters.in')}
              title="Log in as Packaged Water Manufacturer"
            >
              <span className="bis-demo-role-tag bis-role-industry">Industry</span>
              <strong>Amitabh Bansal</strong>
              <small>AquaPure Waters (IS 14543)</small>
            </button>
            <button
              type="button"
              className="bis-demo-quick-btn"
              onClick={() => handleQuickDemoLogin('priya.patel@orientappliances.com')}
              title="Log in as Electrical Appliances Manufacturer"
            >
              <span className="bis-demo-role-tag bis-role-industry">Industry</span>
              <strong>Priya Patel</strong>
              <small>Orient Appliances (IS 302)</small>
            </button>
            <button
              type="button"
              className="bis-demo-quick-btn"
              onClick={() => handleQuickDemoLogin('ashok.pandey@nth.gov.in')}
              title="Log in as Testing Laboratory Auditor"
            >
              <span className="bis-demo-role-tag bis-role-auditor">Auditor</span>
              <strong>Dr. Ashok Pandey</strong>
              <small>National Test House (Labs)</small>
            </button>
          </div>
          <button
            type="button"
            className="bis-demo-browse-all-btn"
            onClick={() => setShowDemoModal(true)}
          >
            <span>Browse All 100 Demo Accounts</span>
            <span className="bis-demo-count-pill">100 Profiles</span>
          </button>
        </div>

        {/* Back to BIS Copilot link */}
        <div className="bis-login-bottom-back-wrap">
          <Link to="/assistant" className="bis-login-bottom-back-link">
            <ArrowLeft size={15} />
            <span>Back to BIS Copilot</span>
          </Link>
        </div>

        {/* Account Registration Row */}
        <div className="bis-login-register-row">
          <span>Don't have an account? </span>
          <a
            href="https://www.manakonline.in"
            target="_blank"
            rel="noopener noreferrer"
            className="bis-create-account-link"
          >
            Create account
          </a>
        </div>

        {/* Security and Statutory Notice Footer */}
        <div className="bis-login-footer">
          <div className="bis-login-security-tag">
            <Shield size={14} className="bis-security-icon" />
            <span>Protected by Government of India Information Security Directives</span>
          </div>
          <p className="bis-login-statutory-note">
            Unauthorized access or misuse is punishable under the BIS Act, 2016 and Information Technology Act, 2000.
          </p>
        </div>
      </div>

      {/* 100 Demo Profiles Modal */}
      {showDemoModal && (
        <div className="bis-demo-modal-overlay" onClick={() => setShowDemoModal(false)}>
          <div className="bis-demo-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bis-demo-modal-header">
              <h3 className="bis-demo-modal-title">
                <Sparkles size={18} color="#2563EB" />
                <span>100 Verified BIS Demo Accounts</span>
              </h3>
              <button
                type="button"
                className="bis-demo-modal-close"
                onClick={() => setShowDemoModal(false)}
                aria-label="Close demo modal"
              >
                ✕
              </button>
            </div>
            <div className="bis-demo-modal-controls">
              <input
                type="text"
                className="bis-demo-search-input"
                placeholder="Search by name, organization, email, or standard (e.g. water, electric, IS 14543)..."
                value={demoSearch}
                onChange={(e) => setDemoSearch(e.target.value)}
                autoFocus
              />
              <div className="bis-demo-role-tabs">
                {(['All', 'Officer', 'Industry Stakeholder', 'Auditor'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`bis-demo-role-tab ${demoRoleFilter === r ? 'bis-demo-role-tab--active' : ''}`}
                    onClick={() => setDemoRoleFilter(r)}
                  >
                    {r === 'All' ? 'All (100)' : r === 'Officer' ? 'Officers (25)' : r === 'Industry Stakeholder' ? 'Industry (50)' : 'Auditors (25)'}
                  </button>
                ))}
              </div>
            </div>
            <div className="bis-demo-users-list">
              {DEMO_USERS.filter((u) => {
                const matchesRole = demoRoleFilter === 'All' || u.role === demoRoleFilter;
                const q = demoSearch.toLowerCase().trim();
                const matchesSearch =
                  !q ||
                  u.name.toLowerCase().includes(q) ||
                  u.email.toLowerCase().includes(q) ||
                  u.organization.toLowerCase().includes(q) ||
                  u.sampleQuery.toLowerCase().includes(q);
                return matchesRole && matchesSearch;
              }).map((u) => (
                <div key={u.id} className="bis-demo-user-card">
                  <div className="bis-demo-user-info">
                    <div className="bis-demo-user-name-row">
                      <span className="bis-demo-user-name">{u.name}</span>
                      <span className={`bis-demo-role-tag ${u.role === 'Officer' ? 'bis-role-officer' : u.role === 'Industry Stakeholder' ? 'bis-role-industry' : 'bis-role-auditor'}`}>
                        {u.role}
                      </span>
                    </div>
                    <span className="bis-demo-user-org">{u.organization}</span>
                    <span className="bis-demo-user-email">{u.email}</span>
                  </div>
                  <button
                    type="button"
                    className="bis-demo-select-btn"
                    onClick={() => handleQuickDemoLogin(u.email)}
                  >
                    Log In
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { AuthProvider } from '../state/AuthContext';
import { ThemeProvider } from '../state/ThemeContext';

const renderLoginPage = () => {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

describe('LoginPage Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders official BIS logo branding, welcome title, social buttons, divider, email, and password inputs', () => {
    renderLoginPage();

    expect(screen.getByRole('img', { name: /bureau of indian standards/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /bis copilot/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();

    // Social buttons
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue with github/i })).toBeInTheDocument();

    // Divider
    expect(screen.getByText('OR')).toBeInTheDocument();

    // Form controls
    expect(screen.getByLabelText(/official email or bis id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^log in$/i })).toBeInTheDocument();

    // Registration link
    expect(screen.getByRole('link', { name: /create account/i })).toBeInTheDocument();
  });

  it('handles Google authentication click and shows error gracefully without fake login', async () => {
    renderLoginPage();

    const googleBtn = screen.getByRole('button', { name: /continue with google/i });
    fireEvent.click(googleBtn);

    await waitFor(() => {
      expect(screen.getByText(/google sign-in could not be completed/i)).toBeInTheDocument();
    });
  });

  it('handles GitHub authentication click and shows error gracefully without fake login', async () => {
    renderLoginPage();

    const githubBtn = screen.getByRole('button', { name: /continue with github/i });
    fireEvent.click(githubBtn);

    await waitFor(() => {
      expect(screen.getByText(/github sign-in could not be completed/i)).toBeInTheDocument();
    });
  });

  it('validates empty inputs and displays field error messages', async () => {
    renderLoginPage();

    const submitBtn = screen.getByRole('button', { name: /^log in$/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/please enter your email address/i)).toBeInTheDocument();
    });
  });

  it('validates invalid email format', async () => {
    renderLoginPage();

    const emailInput = screen.getByLabelText(/official email or bis id/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const submitBtn = screen.getByRole('button', { name: /^log in$/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('toggles password visibility when eye button is clicked', () => {
    renderLoginPage();

    const passwordInput = screen.getByLabelText(/^password/i) as HTMLInputElement;
    expect(passwordInput.type).toBe('password');

    const toggleBtn = screen.getByLabelText(/show password/i);
    fireEvent.click(toggleBtn);

    expect(passwordInput.type).toBe('text');
    expect(screen.getByLabelText(/hide password/i)).toBeInTheDocument();
  });

  it('displays statutory password reset guidance when forgot password is clicked', () => {
    renderLoginPage();

    const forgotBtn = screen.getByRole('button', { name: /forgot password\?/i });
    fireEvent.click(forgotBtn);

    expect(screen.getByText(/password reset information/i)).toBeInTheDocument();
    expect(screen.getByText(/manakonline portal/i)).toBeInTheDocument();
  });
});

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React component tree:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // storage unavailable
    }
    window.location.href = '/assistant';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F3F6FA',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            padding: '24px',
            color: '#14213D',
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              width: '100%',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #D8E1EC',
              padding: '32px',
              boxShadow: '0 4px 16px rgba(16, 42, 86, 0.08)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '42px', marginBottom: '16px' }}>🏛️</div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#173B73' }}>
              BIS Copilot
            </h2>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#B42318' }}>
              Something unexpected happened
            </h3>
            <p style={{ fontSize: '14px', color: '#52637A', marginBottom: '24px', lineHeight: 1.5 }}>
              The application encountered an issue while loading. This can happen due to a stale
              cached version or browser extension conflict.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="primary" size="md" onClick={this.handleReload}>
                Reload Page
              </Button>
              <Button variant="outline" size="md" onClick={this.handleClearAndReload}>
                Clear Cache & Restart
              </Button>
            </div>
            {this.state.error && (
              <details style={{ marginTop: '20px', textAlign: 'left', fontSize: '12px', color: '#76859A' }}>
                <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>Technical details</summary>
                <pre
                  style={{
                    backgroundColor: '#EEF3FA',
                    padding: '8px',
                    borderRadius: '6px',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}
                >
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

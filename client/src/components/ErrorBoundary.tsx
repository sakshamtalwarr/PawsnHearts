import React, { Component, ErrorInfo, ReactNode } from 'react';

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
    console.error('Uncaught React Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fff0f5] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-xl border border-pink-200">
            <div className="text-4xl mb-3">🐶</div>
            <h2 className="text-xl font-black text-slate-900 mb-2 font-display">
              Oops! Something went slightly woof!
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mb-4 font-medium">
              We encountered a minor display hiccup. Click below to reload cleanly.
            </p>
            {this.state.error && (
              <details className="text-left mb-5">
                <summary className="text-[11px] text-pink-600 font-bold cursor-pointer hover:underline">
                  View technical details
                </summary>
                <pre className="mt-2 text-[10px] font-mono bg-rose-50 text-rose-700 p-2.5 rounded-xl border border-rose-200 overflow-auto max-h-32">
                  {this.state.error.message || String(this.state.error)}
                </pre>
              </details>
            )}
            <button
              onClick={() => {
                try {
                  localStorage.removeItem('paws_animals');
                  localStorage.removeItem('paws_stats');
                  localStorage.removeItem('paws_settings');
                } catch {}
                window.location.href = '/';
              }}
              className="px-6 py-2.5 rounded-full bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs font-display shadow-md transition-all active:scale-95"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

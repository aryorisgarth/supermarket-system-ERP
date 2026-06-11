import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="max-w-md w-full bg-white rounded-lg shadow-enterprise border border-border-light p-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mb-6">
              <AlertTriangle size={32} className="text-danger" />
            </div>
            
            <h2 className="text-xl font-bold text-text-primary mb-2">
              Error Inesperado
            </h2>
            
            <p className="text-sm text-text-secondary mb-6">
              Ha ocurrido un error en la aplicación. Por favor, recargue la página o contacte al soporte técnico si el problema persiste.
            </p>

            <button
              onClick={this.handleReset}
              className="w-full py-2.5 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Recargar Página
            </button>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-xs font-medium text-text-muted cursor-pointer hover:text-text-secondary">
                  Ver detalles del error (desarrollo)
                </summary>
                <div className="mt-3 p-3 bg-slate-50 rounded border border-border-light overflow-auto max-h-48">
                  <p className="text-xs font-mono text-danger mb-2">
                    {this.state.error.toString()}
                  </p>
                  <pre className="text-[10px] text-text-secondary whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { LatMoveErrorView } from './LatMoveErrorView';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class LatMoveErrorBoundary extends Component<Props, State> {
  state: State = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('LatMoveErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  handleReset = () => {
    window.localStorage.removeItem('latmove:user-inputs:v1');
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <LatMoveErrorView
          error={this.state.error}
          onRetry={this.handleRetry}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

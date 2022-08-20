import * as React from "react";

export interface ErrorState {
  errorOccurred: boolean;
  errorInfo: any;
  error: any;
}

export class ErrorWrapper extends React.Component<{ children?: any }, ErrorState> {
  constructor(props) {
    super(props);
    this.state = { errorOccurred: false, errorInfo: null, error: null };
  }

  componentDidCatch(error, info) {
    this.setState({ errorOccurred: true, errorInfo: info, error });
  }

  render() {
    if (this.state.errorOccurred) {
      console.error(this.state.error, this.state.errorInfo);
      return (
        <div>
          <h1>Something went wrong.</h1>
          <details className="whitespace-pre-wrap">
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    } else {
      return this.props.children;
    }
  }
}

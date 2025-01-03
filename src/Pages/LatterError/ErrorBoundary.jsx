import React, {Component} from "react";
import {ErrorModal} from "../../Reusable_Components/ErrorModal.jsx";

// Our last line of defense for the application.
class ErrorBoundary extends Component {
  // If the app reaches here, it means something has gone way too wrong.
  // This will catch the error and show a friendly error message.

  constructor(props) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError(error) {
    return {hasError: true};
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorModal/>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import App from "./App";
import { isValidClerkPublishableKey } from "./utils/clerk";
import "./index.css";

const rawClerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const hasClerk = isValidClerkPublishableKey(rawClerkKey);

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <MantineProvider>
      {hasClerk ? (
        <ClerkProvider publishableKey={rawClerkKey} signInFallbackRedirectUrl="/doctors">
          <HashRouter>
            <App />
          </HashRouter>
        </ClerkProvider>
      ) : (
        <HashRouter>
          <App />
        </HashRouter>
      )}
    </MantineProvider>
  </ErrorBoundary>
);

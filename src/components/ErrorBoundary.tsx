import React from "react";

type State = { hasError: boolean };

export default class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    // podrías reportar a un servicio externo aquí
    console.error("ErrorBoundary", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, textAlign: "center" }}>
          <h2>Something went wrong.</h2>
          <p>Please reload the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

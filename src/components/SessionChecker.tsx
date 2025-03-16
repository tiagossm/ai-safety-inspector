
import React from "react";

const SessionChecker = ({ children }: { children: React.ReactNode }) => {
  // Simply render children without any authentication checks
  return <>{children}</>;
};

export default SessionChecker;

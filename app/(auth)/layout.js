import React from "react";

// Auth layout — full screen centered, dark background for glassmorphism pages
const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950">
      {children}
    </div>
  );
};

export default AuthLayout;
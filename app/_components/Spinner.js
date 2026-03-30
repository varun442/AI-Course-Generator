import React from "react";

export default function Spinner({ size = "md", className = "" }) {
  const sizes = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} animate-spin rounded-full border-4 border-gray-200 border-t-primary`}
      />
    </div>
  );
}

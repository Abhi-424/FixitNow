import React from "react";

const Loader = ({ size = "md", message = null, fullScreen = false }) => {
  // Size classes
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-4",
    lg: "w-16 h-16 border-4",
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div
        className={`${sizeClasses[size]} border-blue-200 border-t-orange-500 rounded-full animate-spin`}
        role="status"
        aria-label="loading"
      ></div>
      {message && (
        <p className="text-blue-900 font-medium text-sm animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return <div className="flex justify-center items-center py-4">{spinner}</div>;
};

export default Loader;

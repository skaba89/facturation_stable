import React from 'react';

const Button = ({ children, type = 'button', onClick, variant = 'primary', fullWidth = false, disabled = false, className = '' }) => {
  const baseStyles = "py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ease-in-out";

  const variants = {
    primary: `text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`,
    secondary: `text-blue-700 bg-blue-100 hover:bg-blue-200 focus:ring-blue-500`,
    danger: `text-white bg-red-600 hover:bg-red-700 focus:ring-red-500`,
    neutral: `text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-gray-500`,
  };

  const widthClass = fullWidth ? 'w-full flex justify-center' : '';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${disabledClass} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;

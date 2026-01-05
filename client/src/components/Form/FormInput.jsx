import React from 'react';

const FormInput = React.forwardRef(({
  label,
  type = 'text',
  error,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={`appearance-none block w-full px-3 py-2 border ${
          error ? 'border-red-300 placeholder-red-500 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
        } dark:bg-gray-700 dark:text-white rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm transition-colors`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
    </div>
  );
});

FormInput.displayName = 'FormInput';

export default FormInput;

import React from 'react';
import './FormInput.css';

const FormInput = React.forwardRef(({
  label,
  type = 'text',
  error,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`form-group ${className}`}>
      {label && <label className="form-label">{label}</label>}
      <input
        ref={ref}
        type={type}
        className={`form-input ${error ? 'input-error' : ''}`}
        {...props}
      />
      {error && <span className="form-error">{error.message}</span>}
    </div>
  );
});

FormInput.displayName = 'FormInput';

export default FormInput;

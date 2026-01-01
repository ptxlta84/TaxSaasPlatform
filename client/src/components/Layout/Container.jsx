import React from 'react';
import './Container.css';

const Container = ({ 
  children, 
  size = 'md', 
  className = '' 
}) => {
  const sizeClass = `container-${size}`;
  
  return (
    <div className={`container ${sizeClass} ${className}`}>
      {children}
    </div>
  );
};

export default Container;

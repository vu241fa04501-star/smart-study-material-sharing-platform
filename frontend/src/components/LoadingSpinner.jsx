import React from 'react';

const LoadingSpinner = ({ message = 'Loading...', fullPage = false }) => {
  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px',
        gap: '12px',
      }}
    >
      <div
        className="spinner-circle"
        style={{
          width: '36px',
          height: '36px',
          border: '3px solid #e0f2fe',
          borderTop: '3px solid #0284c7',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>
        {message}
      </p>
    </div>
  );

  if (fullPage) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;

import React from 'react';
import { CheckIcon, XIcon, ShieldIcon } from './Icons';

const AlertMessage = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  const getStyle = () => {
    switch (type) {
      case 'success':
        return {
          bg: '#ecfdf5',
          border: '#a7f3d0',
          text: '#065f46',
          iconColor: '#059669',
        };
      case 'error':
        return {
          bg: '#fef2f2',
          border: '#fecaca',
          text: '#991b1b',
          iconColor: '#dc2626',
        };
      case 'warning':
        return {
          bg: '#fffbeb',
          border: '#fde68a',
          text: '#92400e',
          iconColor: '#d97706',
        };
      default:
        return {
          bg: '#f0f9ff',
          border: '#bae6fd',
          text: '#0369a1',
          iconColor: '#0284c7',
        };
    }
  };

  const style = getStyle();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        color: style.text,
        padding: '12px 16px',
        borderRadius: '8px',
        margin: '12px 0',
        fontSize: '14px',
        fontWeight: '500',
        lineHeight: 1.5,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {type === 'success' && <CheckIcon size={18} />}
        {type === 'error' && <XIcon size={18} />}
        {type === 'info' && <ShieldIcon size={18} />}
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Close message"
        >
          <XIcon size={16} />
        </button>
      )}
    </div>
  );
};

export default AlertMessage;

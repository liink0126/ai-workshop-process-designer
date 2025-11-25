import React from 'react';
import { XMarkIcon, ExclamationTriangleIcon, InformationCircleIcon } from './Icon';

interface ErrorMessageProps {
  message: string;
  onClose?: () => void;
  type?: 'error' | 'warning' | 'info';
  actionLabel?: string;
  onAction?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onClose, 
  type = 'error',
  actionLabel,
  onAction 
}) => {
  const colors = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700'
    }
  };

  const colorScheme = colors[type];
  const Icon = type === 'error' ? ExclamationTriangleIcon : InformationCircleIcon;

  return (
    <div className={`${colorScheme.bg} ${colorScheme.border} border rounded-lg p-4 mb-4 animate-fade-in`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${colorScheme.icon}`}>
          <Icon />
        </div>
        <div className="flex-1">
          <p className={`${colorScheme.text} font-medium`}>{message}</p>
          {onAction && actionLabel && (
            <button
              onClick={onAction}
              className={`mt-3 ${colorScheme.button} text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors`}
            >
              {actionLabel}
            </button>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`flex-shrink-0 ${colorScheme.text} hover:opacity-70 transition-opacity`}
            aria-label="닫기"
          >
            <XMarkIcon />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;


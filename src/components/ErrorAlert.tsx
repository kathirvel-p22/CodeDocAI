/**
 * Error Alert Component
 * Displays inline error, warning, and info messages
 */

import React from 'react';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

interface ErrorAlertProps {
  title: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorAlert({
  title,
  message,
  type,
  onRetry,
  onDismiss,
  className = ''
}: ErrorAlertProps) {
  const config = {
    error: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      text: 'text-red-400',
      icon: AlertCircle
    },
    warning: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
      icon: AlertTriangle
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-400',
      icon: Info
    }
  };

  const { bg, border, text, icon: Icon } = config[type];

  return (
    <div className={`${bg} border ${border} rounded-xl p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <Icon className={`w-5 h-5 ${text} flex-shrink-0 mt-0.5`} />
        
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <h3 className={`font-semibold ${text}`}>{title}</h3>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className={`${text} hover:opacity-70 transition-opacity`}
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <p className={`text-sm ${text} opacity-90 leading-relaxed`}>
            {message}
          </p>

          {(onRetry || onDismiss) && (
            <div className="flex space-x-2 pt-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className={`px-3 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/20 transition-colors font-medium ${text}`}
                >
                  Retry
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className={`px-3 py-1.5 text-xs rounded-lg hover:bg-white/10 transition-colors ${text} opacity-75 hover:opacity-100`}
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Toast-style floating alert
 */
interface ToastAlertProps extends ErrorAlertProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  autoClose?: number; // milliseconds
}

export function ToastAlert({
  position = 'top-right',
  autoClose,
  onDismiss,
  ...props
}: ToastAlertProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, isVisible, onDismiss]);

  if (!isVisible) return null;

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 max-w-md animate-slide-in-right`}>
      <ErrorAlert
        {...props}
        onDismiss={() => {
          setIsVisible(false);
          onDismiss?.();
        }}
      />
    </div>
  );
}

/**
 * Banner-style full-width alert
 */
export function BannerAlert({ className = '', ...props }: ErrorAlertProps) {
  return (
    <div className={`w-full ${className}`}>
      <ErrorAlert {...props} />
    </div>
  );
}

import React from 'react';
import { X } from 'lucide-react';

interface FullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  className?: string;
}

export const FullScreenModal: React.FC<FullScreenModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  headerActions,
  className = '',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900 bg-opacity-75" onClick={onClose} />
      
      {/* Modal Panel */}
      <div className={`relative flex h-full w-full flex-col bg-white shadow-xl ${className}`}>
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            {headerActions}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl';
  side?: 'left' | 'right';
}

export const SidePanel: React.FC<SidePanelProps> = ({
  isOpen,
  onClose,
  title,
  children,
  width = 'lg',
  side = 'right',
}) => {
  const widthClasses = {
    sm: 'w-80',
    md: 'w-96',
    lg: 'w-1/2 max-w-2xl',
    xl: 'w-2/3 max-w-4xl',
  };

  const slideClasses = side === 'right' 
    ? 'right-0 transform transition-transform duration-300 ease-in-out' 
    : 'left-0 transform transition-transform duration-300 ease-in-out';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900 bg-opacity-75" onClick={onClose} />
      
      {/* Panel */}
      <div className={`absolute top-0 bottom-0 ${slideClasses} ${widthClasses[width]}`}>
        <div className="flex h-full flex-col bg-white shadow-xl">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

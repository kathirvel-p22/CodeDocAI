/**
 * Loading States & Skeleton Screens
 * Provides visual feedback during async operations
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Graph Loading Skeleton
 */
export function GraphLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-6">
      <div className="h-6 bg-gray-800 rounded w-1/3"></div>
      <div className="h-64 bg-gray-800 rounded flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-gray-600 animate-spin" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="h-20 bg-gray-800 rounded"></div>
        <div className="h-20 bg-gray-800 rounded"></div>
        <div className="h-20 bg-gray-800 rounded"></div>
      </div>
    </div>
  );
}

/**
 * Analysis Loading Skeleton
 */
export function AnalysisLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="border border-gray-800 rounded-xl p-4">
          <div className="h-6 bg-gray-800 rounded w-1/4 mb-3"></div>
          <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-800 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );
}

/**
 * Spinner Component
 */
export function Spinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <Loader2 className={`${sizeClasses[size]} animate-spin ${className}`} />
  );
}

/**
 * Loading Overlay with Progress
 */
interface LoadingOverlayProps {
  progress?: number;
  stage?: string;
  details?: {
    filesProcessed?: number;
    totalFiles?: number;
    graphBuilt?: boolean;
    aiComplete?: boolean;
  };
}

export function LoadingOverlay({ progress = 0, stage = 'Processing...', details }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#0b0c11] border border-emerald-500/30 rounded-2xl p-8 max-w-md w-full space-y-6">
        {/* Spinner */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 relative">
            <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-xl font-bold text-white">Analyzing Project</h3>
          <p className="text-sm text-gray-400">{stage}</p>
        </div>

        {/* Progress Bar */}
        {progress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Detailed Steps */}
        {details && (
          <div className="space-y-2 text-xs text-gray-400">
            <div className="flex items-center space-x-2">
              {details.filesProcessed === details.totalFiles ? (
                <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              )}
              <span>
                Files Processed: {details.filesProcessed || 0} / {details.totalFiles || 0}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {details.graphBuilt ? (
                <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="w-4 h-4 border-2 border-gray-600 rounded-full" />
              )}
              <span>Knowledge Graph Built</span>
            </div>
            <div className="flex items-center space-x-2">
              {details.aiComplete ? (
                <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="w-4 h-4 border-2 border-gray-600 rounded-full" />
              )}
              <span>AI Analysis Complete</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Inline Loading State
 */
export function InlineLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center space-x-2 text-gray-400">
      <Spinner size="sm" />
      <span className="text-sm">{text}</span>
    </div>
  );
}

/**
 * Card Loading Skeleton
 */
export function CardSkeleton() {
  return (
    <div className="animate-pulse border border-gray-800 rounded-xl p-6 space-y-4">
      <div className="h-6 bg-gray-800 rounded w-1/3"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-800 rounded w-full"></div>
        <div className="h-4 bg-gray-800 rounded w-5/6"></div>
        <div className="h-4 bg-gray-800 rounded w-4/6"></div>
      </div>
      <div className="flex space-x-2">
        <div className="h-8 bg-gray-800 rounded flex-1"></div>
        <div className="h-8 bg-gray-800 rounded flex-1"></div>
      </div>
    </div>
  );
}

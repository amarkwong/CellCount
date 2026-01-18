/**
 * ImageUploader component with drag-and-drop and clipboard paste support.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  isUploading: boolean;
  uploadProgress?: number;
}

const ACCEPTED_TYPES = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/tiff': ['.tiff', '.tif'],
  'image/bmp': ['.bmp'],
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelect,
  isUploading,
  uploadProgress = 0,
}) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      setError(null);

      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        if (rejection.errors[0]?.code === 'file-too-large') {
          setError('File exceeds 50MB limit. Please compress or crop the image.');
        } else if (rejection.errors[0]?.code === 'file-invalid-type') {
          setError('Please upload a PNG, JPG, JPEG, TIFF, or BMP image.');
        } else {
          setError(rejection.errors[0]?.message || 'Invalid file.');
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        onImageSelect(acceptedFiles[0]);
      }
    },
    [onImageSelect]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    disabled: isUploading,
  });

  // Handle clipboard paste
  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      if (isUploading) return;

      const items = event.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          event.preventDefault();
          setError(null);

          const file = item.getAsFile();
          if (file) {
            if (file.size > MAX_FILE_SIZE) {
              setError('Pasted image exceeds 50MB limit.');
              return;
            }
            onImageSelect(file);
          }
          return;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [onImageSelect, isUploading]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          relative min-h-[320px] rounded-xl border-2 border-dashed
          flex flex-col items-center justify-center p-8
          transition-all duration-200 ease-in-out cursor-pointer
          ${
            isDragActive && !isDragReject
              ? 'border-state-selected bg-indigo-50 scale-[1.01]'
              : isDragReject
              ? 'border-state-error bg-red-50'
              : isUploading
              ? 'border-gray-300 bg-gray-50 cursor-wait'
              : 'border-gray-300 bg-gray-50 hover:border-state-selected hover:bg-indigo-50'
          }
        `}
      >
        <input {...getInputProps()} />

        {isUploading ? (
          <div className="flex flex-col items-center gap-4 w-full">
            {/* Loading Spinner */}
            <div className="relative">
              <svg
                className="animate-spin h-16 w-16 text-deep-navy"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-xs">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Analyzing blood smear...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-deep-navy rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>

            <p className="text-sm text-gray-500">Detecting cell boundaries...</p>
          </div>
        ) : (
          <>
            {/* Upload Icon */}
            <svg
              className={`h-16 w-16 mb-4 transition-colors ${
                isDragActive ? 'text-state-selected' : 'text-gray-400'
              }`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
              />
            </svg>

            {/* Instructions */}
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-700 mb-1">
                Drop blood smear image here
              </p>
              <p className="text-gray-500 mb-4">or paste from clipboard (Ctrl+V / Cmd+V)</p>

              <button
                type="button"
                className="px-6 py-2 bg-deep-navy text-white rounded-md font-semibold
                         hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-2
                         focus:ring-deep-navy focus:ring-offset-2"
              >
                Browse Files
              </button>

              <p className="text-sm text-gray-400 mt-4">
                PNG, JPG, JPEG, TIFF, BMP - Max 50MB
              </p>
            </div>
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 flex items-center gap-2">
            <svg
              className="h-5 w-5 flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        </div>
      )}
    </div>
  );
};

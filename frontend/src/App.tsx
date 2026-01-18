/**
 * Main App component for CellCount frontend.
 */

import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ImagePreview } from './components/ImagePreview';
import { CellCountPanel } from './components/CellCountPanel';
import { CellTypeToggle } from './components/CellTypeToggle';
import { detectCells } from './api/detection';
import {
  CellCounts,
  CellDetection,
  CellType,
  VisibleCellTypes,
} from './types/detection';

type AppState = 'upload' | 'loading' | 'results' | 'error';

const App: React.FC = () => {
  // App state
  const [appState, setAppState] = useState<AppState>('upload');
  const [error, setError] = useState<string | null>(null);

  // Image state
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);

  // Detection state
  const [counts, setCounts] = useState<CellCounts>({ rbc: 0, wbc: 0, platelets: 0 });
  const [detections, setDetections] = useState<CellDetection[]>([]);

  // Visibility state
  const [visibleCellTypes, setVisibleCellTypes] = useState<VisibleCellTypes>({
    RBC: true,
    WBC: true,
    Platelets: true,
  });

  // Upload progress (simulated for UX)
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageSelect = useCallback(async (file: File) => {
    setAppState('loading');
    setError(null);
    setUploadProgress(0);

    // Create object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setImageUrl(objectUrl);

    // Simulate progress (since we can't get real upload progress from fetch)
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      const result = await detectCells(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        setCounts(result.counts);
        setDetections(result.detections);
        setImageWidth(result.image_width);
        setImageHeight(result.image_height);
        setAppState('results');
      } else {
        throw new Error(result.message || 'Detection failed');
      }
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setAppState('error');

      // Clean up object URL on error
      URL.revokeObjectURL(objectUrl);
      setImageUrl(null);
    }
  }, []);

  const handleToggleCellType = useCallback((cellType: CellType) => {
    setVisibleCellTypes((prev) => ({
      ...prev,
      [cellType]: !prev[cellType],
    }));
  }, []);

  const handleNewAnalysis = useCallback(() => {
    // Clean up previous image URL
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }

    // Reset state
    setAppState('upload');
    setImageUrl(null);
    setCounts({ rbc: 0, wbc: 0, platelets: 0 });
    setDetections([]);
    setVisibleCellTypes({ RBC: true, WBC: true, Platelets: true });
    setError(null);
    setUploadProgress(0);
  }, [imageUrl]);

  return (
    <div className="min-h-screen bg-clinical-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <svg
                className="h-8 w-8 text-deep-navy"
                viewBox="0 0 32 32"
                fill="currentColor"
              >
                <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="16" cy="16" r="8" fill="currentColor" opacity="0.3" />
                <circle cx="16" cy="16" r="4" fill="currentColor" />
              </svg>
              <h1 className="text-xl font-semibold text-deep-navy">CellCount</h1>
            </div>

            {appState === 'results' && (
              <button
                onClick={handleNewAnalysis}
                className="px-4 py-2 text-sm font-medium text-deep-navy border border-gray-300
                         rounded-md hover:bg-gray-50 transition-colors"
              >
                New Analysis
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload State */}
        {(appState === 'upload' || appState === 'loading') && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <ImageUploader
              onImageSelect={handleImageSelect}
              isUploading={appState === 'loading'}
              uploadProgress={uploadProgress}
            />

            {appState === 'upload' && (
              <div className="mt-8 max-w-xl mx-auto">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Quick Start Guide
                  </h2>
                  <ol className="space-y-3 text-sm text-gray-600">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-deep-navy text-white
                                     flex items-center justify-center text-xs font-medium">
                        1
                      </span>
                      <span>Upload a blood smear image (PNG, JPG, TIFF, or BMP)</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-deep-navy text-white
                                     flex items-center justify-center text-xs font-medium">
                        2
                      </span>
                      <span>AI will automatically detect and count RBCs, WBCs, and Platelets</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-deep-navy text-white
                                     flex items-center justify-center text-xs font-medium">
                        3
                      </span>
                      <span>Toggle cell type visibility to review detection accuracy</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-deep-navy text-white
                                     flex items-center justify-center text-xs font-medium">
                        4
                      </span>
                      <span>View counts, ratios, and identify any missed or overlapping cells</span>
                    </li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error State */}
        {appState === 'error' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-white rounded-lg border border-red-200 p-8 max-w-md text-center">
              <svg
                className="h-16 w-16 text-red-500 mx-auto mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Analysis Failed
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={handleNewAnalysis}
                className="px-6 py-2 bg-deep-navy text-white rounded-md font-semibold
                         hover:bg-opacity-90 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Results State */}
        {appState === 'results' && imageUrl && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Image Preview - Takes most of the space */}
            <div className="lg:col-span-8 xl:col-span-9">
              <div className="h-[600px]">
                <ImagePreview
                  imageUrl={imageUrl}
                  detections={detections}
                  visibleCellTypes={visibleCellTypes}
                  imageWidth={imageWidth}
                  imageHeight={imageHeight}
                />
              </div>

              {/* Visibility Toggle - Below image on larger screens */}
              <div className="mt-4">
                <CellTypeToggle
                  visibleTypes={visibleCellTypes}
                  onToggle={handleToggleCellType}
                  counts={counts}
                />
              </div>
            </div>

            {/* Cell Count Panel - Sidebar */}
            <div className="lg:col-span-4 xl:col-span-3">
              <div className="sticky top-4">
                <CellCountPanel counts={counts} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            CellCount - Blood Cell Detection powered by YOLOv8
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;

/**
 * ImagePreview component with cell detection overlays.
 */

import React, { useEffect, useRef, useState } from 'react';
import { CellDetection, VisibleCellTypes } from '../types/detection';

interface ImagePreviewProps {
  imageUrl: string;
  detections: CellDetection[];
  visibleCellTypes: VisibleCellTypes;
  imageWidth: number;
  imageHeight: number;
}

// Cell type colors from UX spec
const CELL_COLORS: Record<string, string> = {
  RBC: '#E07A5F',      // Coral Red
  WBC: '#3D5A80',      // Ocean Blue
  Platelets: '#F2CC8F', // Amber Yellow
};

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageUrl,
  detections,
  visibleCellTypes,
  imageWidth,
  imageHeight,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Calculate scale to fit image in container
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current && imageWidth > 0 && imageHeight > 0) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;

        setContainerSize({ width: containerWidth, height: containerHeight });

        // Calculate scale to fit while maintaining aspect ratio
        const scaleX = containerWidth / imageWidth;
        const scaleY = containerHeight / imageHeight;
        const newScale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 1

        setScale(newScale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [imageWidth, imageHeight]);

  // Filter detections based on visibility
  const visibleDetections = detections.filter(
    (detection) => visibleCellTypes[detection.cell_type]
  );

  // Calculate scaled image dimensions
  const scaledWidth = imageWidth * scale;
  const scaledHeight = imageHeight * scale;

  // Calculate offset to center the image
  const offsetX = (containerSize.width - scaledWidth) / 2;
  const offsetY = (containerSize.height - scaledHeight) / 2;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-gray-800 rounded-lg overflow-hidden"
      style={{ minHeight: '400px' }}
    >
      {/* Image Container */}
      <div
        className="absolute"
        style={{
          left: `${offsetX}px`,
          top: `${offsetY}px`,
          width: `${scaledWidth}px`,
          height: `${scaledHeight}px`,
        }}
      >
        {/* Base Image */}
        <img
          src={imageUrl}
          alt="Blood smear"
          className="w-full h-full object-contain"
          draggable={false}
        />

        {/* Overlay SVG for bounding boxes */}
        <svg
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          viewBox={`0 0 ${imageWidth} ${imageHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {visibleDetections.map((detection, index) => {
            const { x_min, y_min, x_max, y_max } = detection.bounding_box;
            const color = CELL_COLORS[detection.cell_type] || '#FFFFFF';
            const width = x_max - x_min;
            const height = y_max - y_min;

            // Different stroke styles for different cell types
            let strokeDasharray = 'none';
            if (detection.cell_type === 'WBC') {
              strokeDasharray = '6,3'; // Dashed
            } else if (detection.cell_type === 'Platelets') {
              strokeDasharray = '2,2'; // Dotted
            }

            // Different shapes for different cell types
            if (detection.cell_type === 'RBC') {
              // Circle for RBC
              const cx = x_min + width / 2;
              const cy = y_min + height / 2;
              const rx = width / 2;
              const ry = height / 2;

              return (
                <ellipse
                  key={`rbc-${index}`}
                  cx={cx}
                  cy={cy}
                  rx={rx}
                  ry={ry}
                  fill={`${color}1A`} // 10% opacity fill
                  stroke={color}
                  strokeWidth={2 / scale}
                  className="transition-opacity duration-200"
                />
              );
            } else if (detection.cell_type === 'WBC') {
              // Rounded square for WBC
              return (
                <rect
                  key={`wbc-${index}`}
                  x={x_min}
                  y={y_min}
                  width={width}
                  height={height}
                  rx={4}
                  ry={4}
                  fill={`${color}1A`} // 10% opacity fill
                  stroke={color}
                  strokeWidth={2 / scale}
                  strokeDasharray={strokeDasharray}
                  className="transition-opacity duration-200"
                />
              );
            } else {
              // Triangle for Platelets
              const cx = x_min + width / 2;
              const topY = y_min;
              const bottomY = y_max;
              const points = `${cx},${topY} ${x_min},${bottomY} ${x_max},${bottomY}`;

              return (
                <polygon
                  key={`platelet-${index}`}
                  points={points}
                  fill={`${color}26`} // 15% opacity fill
                  stroke={color}
                  strokeWidth={2 / scale}
                  strokeDasharray={strokeDasharray}
                  className="transition-opacity duration-200"
                />
              );
            }
          })}
        </svg>
      </div>

      {/* Zoom indicator (bottom right) */}
      <div className="absolute bottom-3 right-3 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-sm font-mono">
        {Math.round(scale * 100)}%
      </div>

      {/* Detection count indicator (top right) */}
      <div className="absolute top-3 right-3 bg-black bg-opacity-60 text-white px-3 py-2 rounded text-sm">
        <span className="font-semibold">{visibleDetections.length}</span>
        <span className="text-gray-300"> / {detections.length} visible</span>
      </div>
    </div>
  );
};

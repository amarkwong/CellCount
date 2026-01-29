/**
 * ImagePreview component with cell detection overlays.
 * Updated to support WBC differential classification (5 subtypes).
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  CellDetection,
  CellType,
  VisibleCellTypes,
  CELL_TYPE_COLORS,
  isWBCSubtype,
} from '../types/detection';

interface ImagePreviewProps {
  imageUrl: string;
  detections: CellDetection[];
  visibleCellTypes: VisibleCellTypes;
  imageWidth: number;
  imageHeight: number;
}

/**
 * Get the rendering shape for a cell type
 * RBC = ellipse (circle)
 * WBC subtypes = rounded rectangle (square)
 * Platelets = triangle
 */
const getCellShape = (cellType: CellType): 'ellipse' | 'rect' | 'polygon' => {
  if (cellType === 'RBC') return 'ellipse';
  if (cellType === 'Platelets') return 'polygon';
  // All WBC subtypes use rectangle
  return 'rect';
};

/**
 * Get the stroke dash array for a cell type
 * RBC = solid
 * WBC subtypes = dashed
 * Platelets = dotted
 */
const getStrokeDasharray = (cellType: CellType): string => {
  if (cellType === 'RBC') return 'none';
  if (cellType === 'Platelets') return '2,2';
  // All WBC subtypes use dashed
  return '6,3';
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
  const visibleDetections = detections.filter((detection) => {
    const cellType = detection.cell_type as CellType;
    return visibleCellTypes[cellType];
  });

  // Calculate scaled image dimensions
  const scaledWidth = imageWidth * scale;
  const scaledHeight = imageHeight * scale;

  // Calculate offset to center the image
  const offsetX = (containerSize.width - scaledWidth) / 2;
  const offsetY = (containerSize.height - scaledHeight) / 2;

  // Render a single detection marker
  const renderDetectionMarker = (detection: CellDetection, index: number) => {
    const { x_min, y_min, x_max, y_max } = detection.bounding_box;
    const cellType = detection.cell_type as CellType;
    const color = CELL_TYPE_COLORS[cellType] || '#FFFFFF';
    const width = x_max - x_min;
    const height = y_max - y_min;
    const shape = getCellShape(cellType);
    const strokeDasharray = getStrokeDasharray(cellType);

    if (shape === 'ellipse') {
      // Circle/Ellipse for RBC
      const cx = x_min + width / 2;
      const cy = y_min + height / 2;
      const rx = width / 2;
      const ry = height / 2;

      return (
        <ellipse
          key={`${cellType}-${index}`}
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
    } else if (shape === 'rect') {
      // Rounded rectangle for WBC subtypes
      return (
        <rect
          key={`${cellType}-${index}`}
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
          key={`${cellType}-${index}`}
          points={points}
          fill={`${color}26`} // 15% opacity fill
          stroke={color}
          strokeWidth={2 / scale}
          strokeDasharray={strokeDasharray}
          className="transition-opacity duration-200"
        />
      );
    }
  };

  // Count visible detections by type for the legend
  const getVisibleCountByType = (): Map<CellType, number> => {
    const countMap = new Map<CellType, number>();
    visibleDetections.forEach((detection) => {
      const cellType = detection.cell_type as CellType;
      countMap.set(cellType, (countMap.get(cellType) || 0) + 1);
    });
    return countMap;
  };

  const visibleCountByType = getVisibleCountByType();

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
          {visibleDetections.map((detection, index) =>
            renderDetectionMarker(detection, index)
          )}
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

      {/* Mini legend showing visible WBC subtypes (bottom left) */}
      {visibleDetections.some((d) => isWBCSubtype(d.cell_type as CellType)) && (
        <div className="absolute bottom-3 left-3 bg-black bg-opacity-60 text-white px-3 py-2 rounded text-xs">
          <div className="font-semibold mb-1">WBC Types</div>
          <div className="flex flex-wrap gap-2">
            {(['Neutrophil', 'Lymphocyte', 'Monocyte', 'Eosinophil', 'Basophil'] as CellType[]).map(
              (type) => {
                const count = visibleCountByType.get(type) || 0;
                if (count === 0) return null;
                return (
                  <div key={type} className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-sm"
                      style={{ backgroundColor: CELL_TYPE_COLORS[type] }}
                    />
                    <span>{count}</span>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * CellTypeToggle component for toggling visibility of cell types.
 * Updated to support WBC differential classification (5 subtypes).
 */

import React, { useState } from 'react';
import {
  CellType,
  VisibleCellTypes,
  CellCounts,
  CELL_TYPE_COLORS,
  CELL_TYPE_LABELS,
  getTotalWBC,
  WBCSubtype,
} from '../types/detection';

interface CellTypeToggleProps {
  visibleTypes: VisibleCellTypes;
  onToggle: (cellType: CellType) => void;
  counts: CellCounts;
}

type IconType = 'circle' | 'square' | 'triangle';

interface CellTypeConfig {
  type: CellType;
  label: string;
  color: string;
  icon: IconType;
  isWBCSubtype?: boolean;
}

// Main cell types (RBC, WBC group, Platelets)
const MAIN_CELL_TYPES: CellTypeConfig[] = [
  {
    type: 'RBC',
    label: CELL_TYPE_LABELS.RBC,
    color: CELL_TYPE_COLORS.RBC,
    icon: 'circle',
  },
];

// WBC subtypes configuration
const WBC_SUBTYPES: CellTypeConfig[] = [
  {
    type: 'Neutrophil',
    label: CELL_TYPE_LABELS.Neutrophil,
    color: CELL_TYPE_COLORS.Neutrophil,
    icon: 'square',
    isWBCSubtype: true,
  },
  {
    type: 'Lymphocyte',
    label: CELL_TYPE_LABELS.Lymphocyte,
    color: CELL_TYPE_COLORS.Lymphocyte,
    icon: 'square',
    isWBCSubtype: true,
  },
  {
    type: 'Monocyte',
    label: CELL_TYPE_LABELS.Monocyte,
    color: CELL_TYPE_COLORS.Monocyte,
    icon: 'square',
    isWBCSubtype: true,
  },
  {
    type: 'Eosinophil',
    label: CELL_TYPE_LABELS.Eosinophil,
    color: CELL_TYPE_COLORS.Eosinophil,
    icon: 'square',
    isWBCSubtype: true,
  },
  {
    type: 'Basophil',
    label: CELL_TYPE_LABELS.Basophil,
    color: CELL_TYPE_COLORS.Basophil,
    icon: 'square',
    isWBCSubtype: true,
  },
];

// Platelets config
const PLATELETS_CONFIG: CellTypeConfig = {
  type: 'Platelets',
  label: CELL_TYPE_LABELS.Platelets,
  color: CELL_TYPE_COLORS.Platelets,
  icon: 'triangle',
};

const CellIcon: React.FC<{ icon: IconType; color: string; small?: boolean }> = ({
  icon,
  color,
  small = false,
}) => {
  const size = small ? 'w-3 h-3' : 'w-4 h-4';

  switch (icon) {
    case 'circle':
      return (
        <span
          className={`${size} rounded-full border-2`}
          style={{ borderColor: color, backgroundColor: `${color}1A` }}
        />
      );
    case 'square':
      return (
        <span
          className={`${size} rounded border-2`}
          style={{
            borderColor: color,
            backgroundColor: `${color}1A`,
            borderStyle: 'dashed',
          }}
        />
      );
    case 'triangle':
      return (
        <svg className={size} viewBox="0 0 16 16">
          <polygon
            points="8,2 14,14 2,14"
            fill={`${color}26`}
            stroke={color}
            strokeWidth="1.5"
            strokeDasharray="2,2"
          />
        </svg>
      );
  }
};

// Get count for a cell type from the counts object
const getCountForType = (counts: CellCounts, cellType: CellType): number => {
  switch (cellType) {
    case 'RBC':
      return counts.rbc;
    case 'Platelets':
      return counts.platelets;
    case 'Neutrophil':
      return counts.neutrophil;
    case 'Lymphocyte':
      return counts.lymphocyte;
    case 'Monocyte':
      return counts.monocyte;
    case 'Eosinophil':
      return counts.eosinophil;
    case 'Basophil':
      return counts.basophil;
    default:
      return 0;
  }
};

// All WBC subtypes array for quick access
const ALL_WBC_SUBTYPES: WBCSubtype[] = ['Neutrophil', 'Lymphocyte', 'Monocyte', 'Eosinophil', 'Basophil'];

// Check if all WBC subtypes are visible
const areAllWBCVisible = (visibleTypes: VisibleCellTypes): boolean => {
  return ALL_WBC_SUBTYPES.every((type) => visibleTypes[type]);
};

// Check if any WBC subtype is visible
const isAnyWBCVisible = (visibleTypes: VisibleCellTypes): boolean => {
  return ALL_WBC_SUBTYPES.some((type) => visibleTypes[type]);
};

export const CellTypeToggle: React.FC<CellTypeToggleProps> = ({
  visibleTypes,
  onToggle,
  counts,
}) => {
  const [wbcExpanded, setWbcExpanded] = useState(true);
  const totalWBC = getTotalWBC(counts);

  // Toggle all WBC subtypes
  const toggleAllWBC = (show: boolean) => {
    ALL_WBC_SUBTYPES.forEach((type) => {
      if (show !== visibleTypes[type]) {
        onToggle(type);
      }
    });
  };

  // Show all cell types
  const showAll = () => {
    const allTypes: CellType[] = ['RBC', 'Platelets', ...ALL_WBC_SUBTYPES];
    allTypes.forEach((type) => {
      if (!visibleTypes[type]) {
        onToggle(type);
      }
    });
  };

  // Hide all cell types
  const hideAll = () => {
    const allTypes: CellType[] = ['RBC', 'Platelets', ...ALL_WBC_SUBTYPES];
    allTypes.forEach((type) => {
      if (visibleTypes[type]) {
        onToggle(type);
      }
    });
  };

  const renderToggleItem = (config: CellTypeConfig, indented: boolean = false) => {
    const { type, label, color, icon } = config;
    const count = getCountForType(counts, type);

    return (
      <label
        key={type}
        className={`flex items-center gap-3 cursor-pointer group ${indented ? 'pl-4' : ''}`}
      >
        {/* Custom Checkbox */}
        <div className="relative">
          <input
            type="checkbox"
            checked={visibleTypes[type]}
            onChange={() => onToggle(type)}
            className="sr-only peer"
          />
          <div
            className={`
              w-5 h-5 rounded border-2 transition-all
              ${
                visibleTypes[type]
                  ? 'border-deep-navy bg-deep-navy'
                  : 'border-gray-300 bg-white group-hover:border-gray-400'
              }
            `}
          >
            {visibleTypes[type] && (
              <svg
                className="w-full h-full text-white p-0.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Cell Icon */}
        <CellIcon icon={icon} color={color} small={indented} />

        {/* Label and Count */}
        <div className="flex-1 flex items-center justify-between">
          <span
            className={`text-sm transition-colors ${
              visibleTypes[type] ? 'text-gray-800' : 'text-gray-400'
            } ${indented ? 'text-xs' : ''}`}
          >
            {label}
          </span>
          <span
            className={`text-sm font-mono transition-colors ${
              visibleTypes[type] ? 'text-gray-600' : 'text-gray-300'
            } ${indented ? 'text-xs' : ''}`}
          >
            ({count.toLocaleString()})
          </span>
        </div>
      </label>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Visibility</h3>
      <div className="space-y-3">
        {/* RBC */}
        {MAIN_CELL_TYPES.map((config) => renderToggleItem(config))}

        {/* WBC Group */}
        <div className="border-t border-gray-100 pt-3">
          {/* WBC Header with expand/collapse */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleAllWBC(!areAllWBCVisible(visibleTypes))}
                className={`
                  w-5 h-5 rounded border-2 transition-all flex items-center justify-center
                  ${
                    areAllWBCVisible(visibleTypes)
                      ? 'border-deep-navy bg-deep-navy'
                      : isAnyWBCVisible(visibleTypes)
                      ? 'border-deep-navy bg-white'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }
                `}
                aria-label="Toggle all WBC types"
              >
                {areAllWBCVisible(visibleTypes) && (
                  <svg
                    className="w-full h-full text-white p-0.5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {!areAllWBCVisible(visibleTypes) && isAnyWBCVisible(visibleTypes) && (
                  <span className="w-2 h-0.5 bg-deep-navy" />
                )}
              </button>
              <CellIcon icon="square" color={CELL_TYPE_COLORS.Neutrophil} />
              <span className="text-sm text-gray-800 font-medium">
                White Blood Cells
              </span>
              <span className="text-sm font-mono text-gray-600">
                ({totalWBC.toLocaleString()})
              </span>
            </div>
            <button
              onClick={() => setWbcExpanded(!wbcExpanded)}
              className="text-xs text-deep-navy hover:underline flex items-center gap-1"
              aria-expanded={wbcExpanded}
            >
              {wbcExpanded ? 'Collapse' : 'Expand'}
              <svg
                className={`w-3 h-3 transition-transform ${wbcExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* WBC Subtypes */}
          {wbcExpanded && (
            <div className="space-y-2 ml-2 border-l-2 border-gray-200 pl-2">
              {WBC_SUBTYPES.map((config) => renderToggleItem(config, true))}
            </div>
          )}
        </div>

        {/* Platelets */}
        <div className="border-t border-gray-100 pt-3">
          {renderToggleItem(PLATELETS_CONFIG)}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
        <button
          onClick={showAll}
          className="text-xs text-deep-navy hover:underline"
        >
          Show All
        </button>
        <span className="text-gray-300">|</span>
        <button
          onClick={hideAll}
          className="text-xs text-deep-navy hover:underline"
        >
          Hide All
        </button>
      </div>
    </div>
  );
};

/**
 * CellTypeToggle component for toggling visibility of cell types.
 */

import React from 'react';
import { CellType, VisibleCellTypes } from '../types/detection';

interface CellTypeToggleProps {
  visibleTypes: VisibleCellTypes;
  onToggle: (cellType: CellType) => void;
  counts: { rbc: number; wbc: number; platelets: number };
}

interface CellTypeConfig {
  type: CellType;
  label: string;
  color: string;
  icon: 'circle' | 'square' | 'triangle';
  countKey: 'rbc' | 'wbc' | 'platelets';
}

const CELL_TYPES: CellTypeConfig[] = [
  {
    type: 'RBC',
    label: 'Red Blood Cells',
    color: '#E07A5F',
    icon: 'circle',
    countKey: 'rbc',
  },
  {
    type: 'WBC',
    label: 'White Blood Cells',
    color: '#3D5A80',
    icon: 'square',
    countKey: 'wbc',
  },
  {
    type: 'Platelets',
    label: 'Platelets',
    color: '#F2CC8F',
    icon: 'triangle',
    countKey: 'platelets',
  },
];

const CellIcon: React.FC<{ icon: 'circle' | 'square' | 'triangle'; color: string }> = ({
  icon,
  color,
}) => {
  switch (icon) {
    case 'circle':
      return (
        <span
          className="w-4 h-4 rounded-full border-2"
          style={{ borderColor: color, backgroundColor: `${color}1A` }}
        />
      );
    case 'square':
      return (
        <span
          className="w-4 h-4 rounded border-2"
          style={{
            borderColor: color,
            backgroundColor: `${color}1A`,
            borderStyle: 'dashed',
          }}
        />
      );
    case 'triangle':
      return (
        <svg className="w-4 h-4" viewBox="0 0 16 16">
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

export const CellTypeToggle: React.FC<CellTypeToggleProps> = ({
  visibleTypes,
  onToggle,
  counts,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Visibility</h3>
      <div className="space-y-3">
        {CELL_TYPES.map(({ type, label, color, icon, countKey }) => (
          <label
            key={type}
            className="flex items-center gap-3 cursor-pointer group"
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
            <CellIcon icon={icon} color={color} />

            {/* Label and Count */}
            <div className="flex-1 flex items-center justify-between">
              <span
                className={`text-sm transition-colors ${
                  visibleTypes[type] ? 'text-gray-800' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
              <span
                className={`text-sm font-mono transition-colors ${
                  visibleTypes[type] ? 'text-gray-600' : 'text-gray-300'
                }`}
              >
                ({counts[countKey].toLocaleString()})
              </span>
            </div>
          </label>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
        <button
          onClick={() => {
            if (!visibleTypes.RBC) onToggle('RBC');
            if (!visibleTypes.WBC) onToggle('WBC');
            if (!visibleTypes.Platelets) onToggle('Platelets');
          }}
          className="text-xs text-deep-navy hover:underline"
        >
          Show All
        </button>
        <span className="text-gray-300">|</span>
        <button
          onClick={() => {
            if (visibleTypes.RBC) onToggle('RBC');
            if (visibleTypes.WBC) onToggle('WBC');
            if (visibleTypes.Platelets) onToggle('Platelets');
          }}
          className="text-xs text-deep-navy hover:underline"
        >
          Hide All
        </button>
      </div>
    </div>
  );
};

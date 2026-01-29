/**
 * CellCountPanel component for displaying cell counts and ratios.
 * Updated to support WBC differential classification (5 subtypes).
 */

import React, { useState } from 'react';
import { CellCounts, getTotalWBC, CELL_TYPE_COLORS, CELL_TYPE_LABELS } from '../types/detection';

interface CellCountPanelProps {
  counts: CellCounts;
}

// Format large numbers with commas
const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

// Calculate ratio with safety for division by zero
const calculateRatio = (a: number, b: number): string => {
  if (b === 0) return '-';
  const ratio = a / b;
  if (ratio >= 100) {
    return `${Math.round(ratio)}:1`;
  }
  return `${ratio.toFixed(1)}:1`;
};

// Calculate percentage
const calculatePercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
};

// WBC subtype configuration
const WBC_SUBTYPES = [
  { key: 'neutrophil' as const, type: 'Neutrophil' as const, label: 'Neutrophils' },
  { key: 'lymphocyte' as const, type: 'Lymphocyte' as const, label: 'Lymphocytes' },
  { key: 'monocyte' as const, type: 'Monocyte' as const, label: 'Monocytes' },
  { key: 'eosinophil' as const, type: 'Eosinophil' as const, label: 'Eosinophils' },
  { key: 'basophil' as const, type: 'Basophil' as const, label: 'Basophils' },
];

export const CellCountPanel: React.FC<CellCountPanelProps> = ({ counts }) => {
  const { rbc, platelets, neutrophil, lymphocyte } = counts;
  const totalWBC = getTotalWBC(counts);
  const total = rbc + totalWBC + platelets;

  // State for WBC differential expansion
  const [wbcExpanded, setWbcExpanded] = useState(true);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-6 border-b border-gray-200 pb-3">
        Cell Counts
      </h2>

      {/* RBC Count */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: CELL_TYPE_COLORS.RBC }}
          />
          <span className="text-sm font-medium text-gray-600">
            {CELL_TYPE_LABELS.RBC} (RBC)
          </span>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <span className="font-mono text-cell-count-lg text-gray-900">
            {formatNumber(rbc)}
          </span>
        </div>
      </div>

      {/* WBC Count with Differential */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded"
              style={{ backgroundColor: CELL_TYPE_COLORS.Neutrophil }}
            />
            <span className="text-sm font-medium text-gray-600">
              White Blood Cells (WBC)
            </span>
          </div>
          <button
            onClick={() => setWbcExpanded(!wbcExpanded)}
            className="text-xs text-deep-navy hover:underline flex items-center gap-1"
            aria-expanded={wbcExpanded}
            aria-label={wbcExpanded ? 'Collapse WBC differential' : 'Expand WBC differential'}
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

        {/* Total WBC */}
        <div className="bg-gray-50 rounded-lg p-4 mb-2">
          <div className="flex justify-between items-baseline">
            <span className="font-mono text-cell-count-lg text-gray-900">
              {formatNumber(totalWBC)}
            </span>
            <span className="text-xs text-gray-500">Total WBC</span>
          </div>
        </div>

        {/* WBC Differential Breakdown */}
        {wbcExpanded && (
          <div className="mt-3 space-y-2 pl-2 border-l-2 border-gray-200">
            {WBC_SUBTYPES.map(({ key, type, label }) => {
              const count = counts[key];
              const percentage = calculatePercentage(count, totalWBC);
              return (
                <div
                  key={key}
                  className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: CELL_TYPE_COLORS[type] }}
                    />
                    <span className="text-sm text-gray-600">{label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-gray-900">
                      {formatNumber(count)}
                    </span>
                    <span className="font-mono text-xs text-gray-400 w-12 text-right">
                      {percentage}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Platelet Count */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <svg
            className="w-4 h-4"
            viewBox="0 0 16 16"
            fill={CELL_TYPE_COLORS.Platelets}
          >
            <polygon points="8,2 14,14 2,14" />
          </svg>
          <span className="text-sm font-medium text-gray-600">
            {CELL_TYPE_LABELS.Platelets} (PLT)
          </span>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <span className="font-mono text-cell-count-lg text-gray-900">
            {formatNumber(platelets)}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-4" />

      {/* Total */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-700">TOTAL CELLS</span>
          <span className="font-mono text-cell-count-sm text-gray-900">
            {formatNumber(total)}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-4" />

      {/* Ratios */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Cell Ratios</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">RBC : WBC</span>
            <span className="font-mono text-gray-900">{calculateRatio(rbc, totalWBC)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">RBC : Platelets</span>
            <span className="font-mono text-gray-900">{calculateRatio(rbc, platelets)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">WBC : Platelets</span>
            <span className="font-mono text-gray-900">{calculateRatio(totalWBC, platelets)}</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-4" />

      {/* WBC Differential Ratios */}
      {totalWBC > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">WBC Differential</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">N:L Ratio</span>
              <span className="font-mono text-gray-900">
                {calculateRatio(neutrophil, lymphocyte)}
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              (Neutrophil to Lymphocyte Ratio)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

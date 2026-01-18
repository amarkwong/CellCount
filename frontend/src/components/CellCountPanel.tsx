/**
 * CellCountPanel component for displaying cell counts and ratios.
 */

import React from 'react';
import { CellCounts } from '../types/detection';

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

export const CellCountPanel: React.FC<CellCountPanelProps> = ({ counts }) => {
  const { rbc, wbc, platelets } = counts;
  const total = rbc + wbc + platelets;

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
            style={{ backgroundColor: '#E07A5F' }}
          />
          <span className="text-sm font-medium text-gray-600">
            Red Blood Cells (RBC)
          </span>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <span className="font-mono text-cell-count-lg text-gray-900">
            {formatNumber(rbc)}
          </span>
        </div>
      </div>

      {/* WBC Count */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="w-4 h-4 rounded"
            style={{ backgroundColor: '#3D5A80' }}
          />
          <span className="text-sm font-medium text-gray-600">
            White Blood Cells (WBC)
          </span>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <span className="font-mono text-cell-count-lg text-gray-900">
            {formatNumber(wbc)}
          </span>
        </div>
      </div>

      {/* Platelet Count */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <svg
            className="w-4 h-4"
            viewBox="0 0 16 16"
            fill="#F2CC8F"
          >
            <polygon points="8,2 14,14 2,14" />
          </svg>
          <span className="text-sm font-medium text-gray-600">
            Platelets (PLT)
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
            <span className="font-mono text-gray-900">{calculateRatio(rbc, wbc)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">RBC : Platelets</span>
            <span className="font-mono text-gray-900">{calculateRatio(rbc, platelets)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">WBC : Platelets</span>
            <span className="font-mono text-gray-900">{calculateRatio(wbc, platelets)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

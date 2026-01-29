/**
 * Types for cell detection API responses and application state.
 */

export interface BoundingBox {
  x_min: number;
  y_min: number;
  x_max: number;
  y_max: number;
}

/**
 * WBC Subtypes for differential classification
 */
export type WBCSubtype = 'Neutrophil' | 'Lymphocyte' | 'Monocyte' | 'Eosinophil' | 'Basophil';

/**
 * All cell types including WBC subtypes
 */
export type CellType = 'RBC' | 'Platelets' | WBCSubtype;

/**
 * Legacy cell type for backward compatibility
 */
export type LegacyCellType = 'RBC' | 'WBC' | 'Platelets';

export interface CellDetection {
  cell_type: CellType;
  confidence: number;
  bounding_box: BoundingBox;
}

/**
 * Cell counts from the API response with WBC differential
 */
export interface CellCounts {
  rbc: number;
  platelets: number;
  neutrophil: number;
  lymphocyte: number;
  monocyte: number;
  eosinophil: number;
  basophil: number;
}

/**
 * Helper to get total WBC count from all subtypes
 */
export const getTotalWBC = (counts: CellCounts): number => {
  return counts.neutrophil + counts.lymphocyte + counts.monocyte + counts.eosinophil + counts.basophil;
};

/**
 * Check if a cell type is a WBC subtype
 */
export const isWBCSubtype = (cellType: CellType): cellType is WBCSubtype => {
  return ['Neutrophil', 'Lymphocyte', 'Monocyte', 'Eosinophil', 'Basophil'].includes(cellType);
};

export interface DetectionResponse {
  success: boolean;
  message: string;
  counts: CellCounts;
  detections: CellDetection[];
  image_width: number;
  image_height: number;
}

export interface HealthResponse {
  status: string;
  version: string;
  model_loaded: boolean;
}

/**
 * Visibility state for all cell types including WBC subtypes
 */
export interface VisibleCellTypes {
  RBC: boolean;
  Platelets: boolean;
  Neutrophil: boolean;
  Lymphocyte: boolean;
  Monocyte: boolean;
  Eosinophil: boolean;
  Basophil: boolean;
}

/**
 * Color palette for cell types (color-blind friendly)
 * Based on UX Design Spec with WBC subtype variations
 */
export const CELL_TYPE_COLORS: Record<CellType, string> = {
  RBC: '#E07A5F',        // Coral Red
  Platelets: '#F2CC8F',  // Amber Yellow
  Neutrophil: '#3D5A80', // Ocean Blue (primary WBC color - most common)
  Lymphocyte: '#7C3AED', // Purple/Violet
  Monocyte: '#0D9488',   // Teal/Cyan
  Eosinophil: '#EA580C', // Orange
  Basophil: '#DB2777',   // Magenta/Pink
};

/**
 * Display labels for cell types
 */
export const CELL_TYPE_LABELS: Record<CellType, string> = {
  RBC: 'Red Blood Cells',
  Platelets: 'Platelets',
  Neutrophil: 'Neutrophils',
  Lymphocyte: 'Lymphocytes',
  Monocyte: 'Monocytes',
  Eosinophil: 'Eosinophils',
  Basophil: 'Basophils',
};

/**
 * Short labels for cell types
 */
export const CELL_TYPE_SHORT_LABELS: Record<CellType, string> = {
  RBC: 'RBC',
  Platelets: 'PLT',
  Neutrophil: 'NEU',
  Lymphocyte: 'LYM',
  Monocyte: 'MON',
  Eosinophil: 'EOS',
  Basophil: 'BAS',
};

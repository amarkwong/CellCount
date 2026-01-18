/**
 * Types for cell detection API responses and application state.
 */

export interface BoundingBox {
  x_min: number;
  y_min: number;
  x_max: number;
  y_max: number;
}

export interface CellDetection {
  cell_type: 'RBC' | 'WBC' | 'Platelets';
  confidence: number;
  bounding_box: BoundingBox;
}

export interface CellCounts {
  rbc: number;
  wbc: number;
  platelets: number;
}

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

export type CellType = 'RBC' | 'WBC' | 'Platelets';

export interface VisibleCellTypes {
  RBC: boolean;
  WBC: boolean;
  Platelets: boolean;
}

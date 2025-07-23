export interface Position {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  pageWidth: number;
  pageHeight: number;
  pageNumber: number;
}

export interface T_LTWH {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Annotation {
  id: string;
  text: string;
  label: string;
  position: Position;
  isSelected?: boolean;
}

export type PagePosition = {
  pageNumber: number;
  x: number;
  y: number;
};

export const AnnotationColors = {
  SELECTED: "rgba(162, 30, 188, 0.2)",
  UNSELECTED: "rgba(0, 176, 185, 0.2)",
};

export const AnnotationBorderColors = {
  SELECTED: "rgba(162, 30, 188, 0.5)",
  UNSELECTED: "rgba(0, 176, 185, 0.5)",
};

export const TEMP_RECTANGLE_CLASS = "highlight-temp";

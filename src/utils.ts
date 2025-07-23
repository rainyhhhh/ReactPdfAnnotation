import type { Position, T_LTWH } from "./types";

/**
 * convert absolute annotation position to scaled position for rendering.
 * @param position
 * @param pageSize
 * @returns {T_LTWH}
 */
export const getScaledPosition = (
  position: Position,
  pageSize: { width: number; height: number }
): T_LTWH => {
  const scaleX = pageSize.width / position.pageWidth;
  const scaleY = pageSize.height / position.pageHeight;

  const x1 = position.x1 * scaleX;
  const y1 = position.y1 * scaleY;
  const x2 = position.x2 * scaleX;
  const y2 = position.y2 * scaleY;

  return {
    left: Math.min(x1, x2),
    top: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
  };
};

/**
 * convert rendered coordinates to a normalized Position object.
 * @param renderedCoords
 * @param renderedPageSize
 * @param originalPageSize
 * @param pageNumber
 * @returns {Position}
 */
export const normalizePosition = (
  renderedCoords: T_LTWH,
  renderedPageSize: { width: number; height: number },
  originalPageSize: { width: number; height: number },
  pageNumber: number
): Position => {
  const scaleX = originalPageSize.width / renderedPageSize.width;
  const scaleY = originalPageSize.height / renderedPageSize.height;

  return {
    x1: renderedCoords.left * scaleX,
    y1: renderedCoords.top * scaleY,
    x2: (renderedCoords.left + renderedCoords.width) * scaleX,
    y2: (renderedCoords.top + renderedCoords.height) * scaleY,
    pageWidth: originalPageSize.width,
    pageHeight: originalPageSize.height,
    pageNumber,
  };
};

/**
 * find the page element from a target HTMLElement.
 * @param target
 * @returns
 */
export const findPageFromTarget = (
  target: HTMLElement
): { pageElement: HTMLElement; pageIndex: number } | null => {
  let current: HTMLElement | null = target;
  while (current) {
    const testId = current.getAttribute("data-testid");
    if (testId?.startsWith("core__page-")) {
      const match = testId.match(/core__page-layer-(\d+)/);
      if (match) {
        return {
          pageElement: current,
          pageIndex: parseInt(match[1], 10),
        };
      }
    }
    current = current.parentElement;
  }
  return null;
};

// calculate the area of a rectangle given two points
export const calculateArea = (
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): T_LTWH => ({
  left: Math.min(p1.x, p2.x),
  top: Math.min(p1.y, p2.y),
  width: Math.abs(p1.x - p2.x),
  height: Math.abs(p1.y - p2.y),
});

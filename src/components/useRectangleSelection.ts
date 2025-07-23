import { useState, useRef, useCallback, useEffect } from "react";
import {
  AnnotationBorderColors,
  AnnotationColors,
  TEMP_RECTANGLE_CLASS,
  type T_LTWH,
} from "../types";
import { calculateArea, findPageFromTarget } from "../utils";

type SelectionCallback = (selection: T_LTWH, pageIndex: number) => void;

export const useRectangleSelection = (
  viewerRef: React.RefObject<HTMLDivElement>,
  onSelectionEnd: SelectionCallback
) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const activePageRef = useRef<{ element: HTMLElement; index: number } | null>(
    null
  );
  const tempRectRef = useRef<HTMLElement | null>(null);

  // update the temporary rectangle's style
  const updateTempRectStyle = useCallback((rect: T_LTWH | null) => {
    if (!tempRectRef.current) return;
    const el = tempRectRef.current;
    if (rect) {
      el.style.left = `${rect.left}px`;
      el.style.top = `${rect.top}px`;
      el.style.width = `${rect.width}px`;
      el.style.height = `${rect.height}px`;
      el.style.display = "block";
    } else {
      el.style.display = "none";
    }
  }, []);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      // trigger selection only on left click when holding Ctrl
      if (!event.ctrlKey || event.button !== 0 || !viewerRef.current) return;

      event.preventDefault();
      event.stopPropagation();

      const pageInfo = findPageFromTarget(event.target as HTMLElement);
      if (!pageInfo) return;

      activePageRef.current = {
        element: pageInfo.pageElement,
        index: pageInfo.pageIndex,
      };

      // create or reuse the temporary rectangle element
      if (
        !tempRectRef.current ||
        tempRectRef.current.parentElement !== pageInfo.pageElement
      ) {
        if (tempRectRef.current?.parentElement) {
          tempRectRef.current.parentElement.removeChild(tempRectRef.current);
        }
        const tempEl = document.createElement("div");
        tempEl.className = TEMP_RECTANGLE_CLASS;
        Object.assign(tempEl.style, {
          position: "absolute",
          backgroundColor: AnnotationColors.SELECTED,
          border: `2px solid ${AnnotationBorderColors.SELECTED}`,
          pointerEvents: "none",
          zIndex: "100",
        });
        pageInfo.pageElement.appendChild(tempEl);
        tempRectRef.current = tempEl;
      }

      const rect = pageInfo.pageElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      startPointRef.current = { x, y };
      setIsDrawing(true);
      updateTempRectStyle({ left: x, top: y, width: 0, height: 0 });
    },
    [viewerRef, updateTempRectStyle]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDrawing || !startPointRef.current || !activePageRef.current)
        return;

      event.preventDefault();

      const pageRect = activePageRef.current.element.getBoundingClientRect();
      const x = event.clientX - pageRect.left;
      const y = event.clientY - pageRect.top;

      const rect = calculateArea(startPointRef.current, { x, y });
      updateTempRectStyle(rect);
    },
    [isDrawing, updateTempRectStyle]
  );

  const handleMouseUp = useCallback(
    (event: MouseEvent) => {
      if (!isDrawing || !startPointRef.current || !activePageRef.current)
        return;

      event.preventDefault();
      setIsDrawing(false);

      const pageRect = activePageRef.current.element.getBoundingClientRect();
      const x = event.clientX - pageRect.left;
      const y = event.clientY - pageRect.top;

      const finalRect = calculateArea(startPointRef.current, { x, y });
      console.log("Final Rectangle:", finalRect);

      // clean up the temporary rectangle
      updateTempRectStyle(null);
      startPointRef.current = null;

      // if the rectangle is large enough, call the selection end callback
      if (finalRect.width > 5 || finalRect.height > 5) {
        onSelectionEnd(finalRect, activePageRef.current.index);
      }
      activePageRef.current = null;
    },
    [isDrawing, onSelectionEnd, updateTempRectStyle]
  );

  useEffect(() => {
    if (isDrawing) {
      document.body.style.userSelect = "none";
      window.addEventListener("mousemove", handleMouseMove);
      // ensure the mouse up event is captured once
      window.addEventListener("mouseup", handleMouseUp, { once: true });
    }

    return () => {
      document.body.style.userSelect = "auto";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDrawing, handleMouseMove, handleMouseUp]);

  return { handleMouseDown };
};

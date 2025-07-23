import { Viewer, Worker, type RenderPageProps } from "@react-pdf-viewer/core";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import "@react-pdf-viewer/core/lib/styles/index.css";

import { forwardRef, useImperativeHandle, useRef } from "react";
import type { Annotation, T_LTWH } from "../types";
import { getScaledPosition, normalizePosition } from "../utils";
import { useRectangleSelection } from "./useRectangleSelection";
import { DocumentHighlight } from "./DocumentHighlight";

type PdfViewerProps = {
  annotations: Annotation[];
  addAnnotation: (annotation: Annotation) => void;
  fileUrl: string;
};

export const PdfViewer = forwardRef(
  ({ annotations, addAnnotation, fileUrl }: PdfViewerProps, ref) => {
    const viewerRef = useRef<HTMLDivElement>(
      null!
    ) as React.RefObject<HTMLDivElement>;
    const pageNavigationPluginInstance = pageNavigationPlugin();
    const { jumpToPage } = pageNavigationPluginInstance;

    const handleSelectionEnd = (selection: T_LTWH, pageIndex: number) => {
      const pageElement = viewerRef.current?.querySelector(
        `[data-testid="core__page-layer-${pageIndex}"]`
      );
      if (!pageElement) return;

      const renderedPageSize = {
        width: pageElement.clientWidth,
        height: pageElement.clientHeight,
      };

      const newPosition = normalizePosition(
        selection,
        renderedPageSize,
        {
          width: (pageElement as HTMLElement).offsetWidth,
          height: (pageElement as HTMLElement).offsetHeight,
        },
        pageIndex
      );

      addAnnotation({
        id: `${Date.now()}`,
        position: newPosition,
        label: `Label ${annotations.length + 1}`,
        text: `text ${annotations.length + 1}`,
      });
    };

    const { handleMouseDown } = useRectangleSelection(
      viewerRef,
      handleSelectionEnd
    );

    useImperativeHandle(ref, () => ({
      scrollToAnnotation(annotation: Annotation) {
        if (!viewerRef.current) return;
        const scrollContainer = viewerRef.current.querySelector(
          '[data-testid="core__inner-pages"]'
        ) as HTMLElement;
        if (!scrollContainer) return;

        const jumpAndScroll = () => {
          const target_parent_page = scrollContainer.querySelector(
            `div[aria-label="Page ${annotation.position.pageNumber + 1}"]`
          ) as HTMLElement;
          const target_page = target_parent_page.querySelector(
            `.rpv-core__page-layer`
          ) as HTMLElement;
          const position = getScaledPosition(annotation.position, {
            width: target_page.getBoundingClientRect().width,
            height: target_page.getBoundingClientRect().height,
          });
          // get the offsetTop of the target page by translateY
          const transZRegex = /\.*translateY\((.*)px\)/i;
          const arr = transZRegex.exec(target_parent_page.style.transform);
          if (arr && arr.length > 1) {
            const pageTop = parseFloat(arr[1]);
            scrollContainer.scrollTop = pageTop + position.top - 10; // -10 for some padding
          }
          scrollContainer.scrollLeft = position.left - 10; // -10 for some padding
        };

        // jump to the page first
        jumpToPage(annotation.position.pageNumber);
        setTimeout(jumpAndScroll, 400);
      },
    }));

    const renderPage = (props: RenderPageProps) => (
      <>
        {props.canvasLayer.children}
        {props.textLayer.children}{" "}
        {
          <div className="annotation-layber h-full w-full absolute">
            {annotations
              .filter(
                (annotation) =>
                  annotation.position.pageNumber === props.pageIndex
              )
              .map((annotation) => (
                <DocumentHighlight
                  key={annotation.id}
                  annotation={annotation}
                  scaledPosition={getScaledPosition(annotation.position, {
                    width: props.width,
                    height: props.height,
                  })}
                />
              ))}
          </div>
        }
      </>
    );

    return (
      <Worker workerUrl="/pdf.worker.js">
        <div
          ref={viewerRef}
          onMouseDown={handleMouseDown}
          style={{
            height: "750px",
          }}
          className="pdf-viewer-container"
        >
          <Viewer
            fileUrl={fileUrl}
            plugins={[pageNavigationPluginInstance]}
            renderPage={renderPage}
          />
        </div>
      </Worker>
    );
  }
);

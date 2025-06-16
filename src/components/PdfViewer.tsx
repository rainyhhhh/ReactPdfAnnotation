import { Viewer, Worker, type RenderPageProps } from "@react-pdf-viewer/core";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";

import "@react-pdf-viewer/core/lib/styles/index.css";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import {
  drawTransientRectangle,
  findParentPageElement,
  getBoundingRect,
  getCurrentPagePosition,
  getScaledPosition,
  setCurrentPagePosition,
  startTransientRectangle,
  type Annotation,
} from "./HighlightUtils";
import { DocumentHighlight } from "./DocumentHighlight";

type PdfViewerProps = {
  annotations: Annotation[];
  addAnnoation: (annotation: Annotation) => void;
};

export const PdfViewer = forwardRef(
  ({ annotations, addAnnoation }: PdfViewerProps, ref) => {
    const [isStartingArea, setIsStartingArea] = useState(false);
    const pageNumber = useRef(0);
    const pdfViewerRef = useRef<HTMLDivElement>(null)

    const pageNaviationPluginInstance = pageNavigationPlugin();
    const { jumpToPage } = pageNaviationPluginInstance;

    useImperativeHandle(ref, () => ({
      scrollToAnnoatation(annotation: Annotation): void {
        if (!pdfViewerRef.current) return;
        console.log('parent', pdfViewerRef.current)
        const parent = (pdfViewerRef.current)
        ?.querySelector(
          'div[data-testid="core__inner-pages"]'
        ) as HTMLElement;
        if (!parent || !parent.firstChild) return;
        const current_page = parseInt((parent.firstChild as HTMLElement).getAttribute("data-testid")?.split('-')[3] as string);
        if (current_page === annotation.position.pageNumber) {
          startScroll(parent, annotation);
          return;
        }
        jumpToPage(annotation.position.pageNumber);
        setTimeout(() => {
          startScroll(parent, annotation);
        }, 300);
      },
    }));

    const startScroll = (parent: HTMLElement, annotation: Annotation) => {
      const target_parent_page =  parent.querySelector(`div[aria-label="Page ${annotation.position.pageNumber + 1}"]`) as HTMLElement;
      const target_page = target_parent_page.querySelector(
        `.rpv-core__page-layer`) as HTMLElement;
      const position = getScaledPosition(annotation.position, {
        width: target_page.getBoundingClientRect().width,
        height: target_page.getBoundingClientRect().height,
      })
      // get the offsetTop of the target page by translateY
      const transZRegex = /\.*translateY\((.*)px\)/i;
      const arr = transZRegex.exec(target_parent_page.style.transform);
      if (arr && arr.length > 1) {
        const pageTop = parseFloat(arr[1]);
        parent.scrollTop = pageTop + position.top - 10; // -10 for some padding
      }
      parent.scrollLeft = position.left - 10; // -10 for some padding 
    }

    const mouseEvent = (
      $event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
      if ($event.ctrlKey || isStartingArea) {
        $event.stopPropagation();
        $event.preventDefault();
        const pageElement = findParentPageElement($event.target as HTMLElement);
        if (($event.target as HTMLElement)?.getAttribute("data-testid"))
          pageNumber.current = Number(
            ($event.target as HTMLElement)
              ?.getAttribute("data-testid")
              ?.split("-")[2]
          );
        if ($event.type === "mousedown") {
          setIsStartingArea(true);
          // Set the first point of the area
          const pageRectangle = pageElement.getBoundingClientRect();
          console.log(
            "pageRectangle:",
            pageRectangle,
            pageElement.clientLeft,
            pageElement.clientTop
          );
          const x = pageRectangle.left + pageElement.clientLeft;
          const y = pageRectangle.top + pageElement.clientTop;
          // Store the first point for later use
          setCurrentPagePosition({
            pageNumber: pageNumber.current,
            x,
            y,
          });
          // Start the transient rectangle
          const lastMousePosition = {
            x: $event.clientX - getCurrentPagePosition().x,
            y: $event.clientY - getCurrentPagePosition().y,
          };
          startTransientRectangle(lastMousePosition, pageElement);
          console.log("start transient rectangle at:", lastMousePosition);
        } else if ($event.type === "mousemove" && isStartingArea) {
          // Update the transient rectangle
          const lastMousePosition = {
            x: $event.clientX - getCurrentPagePosition().x,
            y: $event.clientY - getCurrentPagePosition().y,
          };
          drawTransientRectangle(lastMousePosition, pageElement);
          //console.log("update transient rectangle at:", lastMousePosition);
        } else if ($event.type === "mouseup" && isStartingArea) {
          // Stop the transient rectangle
          setIsStartingArea(false);
          const boundingRect = getBoundingRect();
          if (boundingRect) {
            // Create a new highlight annotation
            const position = {
              ...boundingRect,
              pageNumber: pageNumber.current,
              pageWidth: pageElement.offsetWidth,
              pageHeight: pageElement.offsetHeight,
            };
            console.log("Highlight created at:", position);
            addAnnoation({
              id: Date.now().toString(),
              position: position,
              label: `label ${annotations.length + 1}`,
              text: "text",
              isSelected: false, // Initially not selected
            });
          }
        }
      }
    };
    return (
      <Worker workerUrl="/pdf.worker.js">
        <div
          style={{ height: "750px" }}
          onMouseDown={mouseEvent}
          onMouseMove={mouseEvent}
          onMouseUp={mouseEvent}
          ref={pdfViewerRef}
        >
          <Viewer
            fileUrl={`http://localhost:5173/example.pdf`}
            plugins={[]}
            renderPage={(props: RenderPageProps) => (
              <>
                {props.canvasLayer.children}

                {props.textLayer.children}
                {/* {props.annotationLayer.children} */}
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
                          scaledPosition={getScaledPosition(
                            annotation.position,
                            {
                              width: props.width,
                              height: props.height,
                            }
                          )}
                        />
                      ))}
                  </div>
                }
              </>
            )}
          />
        </div>
      </Worker>
    );
  }
);

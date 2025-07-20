import { useRef, useState } from "react";
import { mockedAnnotations } from "../components/mock";
import type { Annotation } from "../components/HighlightUtils";
import { PdfViewer } from "../components/PdfViewer";

type PdfViewerHandle = {
  scrollToAnnotation: (annotation: Annotation) => void;
};

export function PdfViewerPage() {
  const [annotations, setAnnotations] = useState(mockedAnnotations);
  const pdfViewerRef = useRef<PdfViewerHandle>(null);
  const addAnnoation = (annotation: Annotation) => {
    setAnnotations((prevAnnotations) => [...prevAnnotations, annotation]);
  };
  const scrollToAnnoatation = (annotation: Annotation) => {
    pdfViewerRef.current?.scrollToAnnotation(annotation);
  };
  return (
    <div className="flex justify-center items-center h-screen p-3">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg p-6 flex justify-between items-center">
        <div className="flex-1 h-full">
          <PdfViewer
            ref={pdfViewerRef}
            annotations={annotations}
            addAnnoation={addAnnoation}
          />
        </div>

        <div className="w-1/4 h-full p-3 flex flex-col justify-between">
          {annotations.map((annotation) => (
            <div key={annotation.id} className="p-2 border-b border-gray-200">
              <p className="text-lg font-semibold">{annotation.label}</p>
              <button className="mb-2 px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={() => scrollToAnnoatation(annotation)}>
                {annotation.text}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

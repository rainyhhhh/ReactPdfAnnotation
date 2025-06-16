import type { Annotation } from "./HighlightUtils";

export const mockedAnnotations: Annotation[] = [
  {
    id: "1",
    text: "text 1",
    label: "label 1",
    position: {
      x1: 242.09375,
      x2: 430.09375,
      y1: 112.5,
      y2: 147.5,
      pageNumber: 0,
      pageWidth: 673,
      pageHeight: 871,
    },
  },
  {
    id: "2",
    text: "text 2",
    label: "label 2",
    position: {
      x1: 342.09375,
      x2: 435.09375,
      y1: 330.29998779296875,
      y2: 354.29998779296875,
      pageNumber: 1,
      pageWidth: 673,
      pageHeight: 871,
    },
  },
];

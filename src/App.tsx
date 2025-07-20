import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PdfViewerPage } from "./pages/pdfViewerPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PdfViewerPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

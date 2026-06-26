import { useState } from 'react';
import { Toolbar } from './components/Toolbar/Toolbar';
import { PageThumbnails } from './components/PageThumbnails/PageThumbnails';
import { PdfViewer } from './components/PdfViewer/PdfViewer';
import { StatusBar } from './components/StatusBar/StatusBar';
import { openPdfFile } from './features/pdf-open/openPdfFile';
import type { OpenedPdf } from './types/pdf';

function App() {
  const [openedPdf, setOpenedPdf] = useState<OpenedPdf | null>(null);

  const handleOpenPdf = async () => {
    const pdf = await openPdfFile();
    if (pdf) {
      setOpenedPdf(pdf);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>ArchPDF</h1>
        <p className="app-subtitle">建築・設計業務向けの軽量PDF編集ツール</p>
      </header>

      <Toolbar onOpenPdf={handleOpenPdf} />

      <main className="app-main">
        <PageThumbnails pdf={openedPdf} />
        <PdfViewer pdf={openedPdf} />
      </main>

      <StatusBar pdf={openedPdf} />
    </div>
  );
}

export default App;

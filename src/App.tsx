import { useState } from 'react';
import { Toolbar } from './components/Toolbar/Toolbar';
import { PageThumbnails } from './components/PageThumbnails/PageThumbnails';
import { PdfViewer } from './components/PdfViewer/PdfViewer';
import { StatusBar } from './components/StatusBar/StatusBar';
import {
  openPdfFile,
  readPdfFile,
  InvalidPdfFileError,
  TauriApiError,
  PdfReadError,
} from './features/pdf-open/openPdfFile';
import { parsePdf, PdfParseError } from './lib/pdfjs';
import type { PDFDocumentProxy } from './lib/pdfjs';
import type { OpenedPdf, PdfOpenStatus } from './types/pdf';

function App() {
  const [openedPdf, setOpenedPdf] = useState<OpenedPdf | null>(null);
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [status, setStatus] = useState<PdfOpenStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOpenPdf = async () => {
    setStatus('loading');
    setErrorMessage(null);

    try {
      const selected = await openPdfFile();
      if (!selected) {
        // ファイル選択キャンセル時は既存の状態を維持する
        setStatus('idle');
        return;
      }

      const data = await readPdfFile(selected.filePath);
      const doc = await parsePdf(data);

      setOpenedPdf({ ...selected, pageCount: doc.numPages });
      setPdfDocument(doc);
      setStatus('idle');
    } catch (error) {
      setOpenedPdf(null);
      setPdfDocument(null);
      setStatus('error');
      setErrorMessage(
        error instanceof InvalidPdfFileError ||
          error instanceof TauriApiError ||
          error instanceof PdfReadError ||
          error instanceof PdfParseError
          ? error.message
          : 'PDFファイルの読み込みに失敗しました。'
      );
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>ArchPDF</h1>
        <p className="app-subtitle">建築・設計業務向けの軽量PDF編集ツール</p>
      </header>

      <Toolbar onOpenPdf={handleOpenPdf} isOpening={status === 'loading'} />

      <main className="app-main">
        <PageThumbnails pdf={openedPdf} />
        <PdfViewer pdf={openedPdf} pdfDocument={pdfDocument} />
      </main>

      <StatusBar pdf={openedPdf} status={status} errorMessage={errorMessage} />
    </div>
  );
}

export default App;

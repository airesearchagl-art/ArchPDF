import { useState } from 'react';
import { Toolbar } from './components/Toolbar/Toolbar';
import { PageThumbnails } from './components/PageThumbnails/PageThumbnails';
import { PdfViewer } from './components/PdfViewer/PdfViewer';
import { StatusBar } from './components/StatusBar/StatusBar';
import { openPdfFile, InvalidPdfFileError } from './features/pdf-open/openPdfFile';
import type { OpenedPdf, PdfOpenStatus } from './types/pdf';

function App() {
  const [openedPdf, setOpenedPdf] = useState<OpenedPdf | null>(null);
  const [status, setStatus] = useState<PdfOpenStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOpenPdf = async () => {
    setStatus('loading');
    setErrorMessage(null);

    try {
      const pdf = await openPdfFile();
      if (pdf) {
        setOpenedPdf(pdf);
      }
      // pdfがnull（キャンセル）の場合は既存の状態を維持する
      setStatus('idle');
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof InvalidPdfFileError
          ? error.message
          : 'PDFファイルの選択に失敗しました。'
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
        <PdfViewer pdf={openedPdf} />
      </main>

      <StatusBar pdf={openedPdf} status={status} errorMessage={errorMessage} />
    </div>
  );
}

export default App;

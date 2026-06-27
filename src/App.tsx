import { useEffect, useState } from 'react';
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
import type { OpenedPdf, PdfOpenStatus, ZoomMode } from './types/pdf';

/** 手動ズームの段階表示倍率。 */
const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3];

/** 入力欄やcontenteditable要素にフォーカスがある場合、ショートカットを無効化するための判定。 */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
}

function App() {
  const [openedPdf, setOpenedPdf] = useState<OpenedPdf | null>(null);
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [status, setStatus] = useState<PdfOpenStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [zoomMode, setZoomMode] = useState<ZoomMode>('fit');
  const [scale, setScale] = useState(1.0);
  const [operationError, setOperationError] = useState<string | null>(null);

  const pageCount = openedPdf?.pageCount ?? 0;

  const requirePdf = (): boolean => {
    if (!openedPdf) {
      setOperationError('PDFが開かれていません。先にPDFを開いてください。');
      return false;
    }
    setOperationError(null);
    return true;
  };

  const handleOpenPdf = async () => {
    setStatus('loading');
    setErrorMessage(null);
    setOperationError(null);

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
      setCurrentPage(1);
      setZoomMode('fit');
      setScale(1.0);
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

  const handlePrevPage = () => {
    if (!requirePdf()) return;
    setCurrentPage((page) => Math.max(1, page - 1));
  };

  const handleNextPage = () => {
    if (!requirePdf()) return;
    setCurrentPage((page) => Math.min(pageCount, page + 1));
  };

  const handleZoomIn = () => {
    if (!requirePdf()) return;
    setZoomMode('custom');
    setScale((current) => {
      const next = ZOOM_LEVELS.find((level) => level > current + 0.001);
      return next ?? ZOOM_LEVELS[ZOOM_LEVELS.length - 1];
    });
  };

  const handleZoomOut = () => {
    if (!requirePdf()) return;
    setZoomMode('custom');
    setScale((current) => {
      const lowerLevels = ZOOM_LEVELS.filter((level) => level < current - 0.001);
      return lowerLevels.length > 0 ? lowerLevels[lowerLevels.length - 1] : ZOOM_LEVELS[0];
    });
  };

  const handleZoom100 = () => {
    if (!requirePdf()) return;
    setZoomMode('custom');
    setScale(1.0);
  };

  const handleFit = () => {
    if (!requirePdf()) return;
    setZoomMode('fit');
  };

  const handleFitScaleComputed = (computedScale: number) => {
    setScale(computedScale);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return;
      }

      const isZoomInKey =
        event.key === '+' ||
        event.key === '=' ||
        event.key === 'Add' ||
        event.code === 'Equal' ||
        event.code === 'NumpadAdd';

      if (event.ctrlKey && isZoomInKey) {
        event.preventDefault();
        handleZoomIn();
      } else if (event.ctrlKey && event.key === '-') {
        event.preventDefault();
        handleZoomOut();
      } else if (event.ctrlKey && event.key === '0') {
        event.preventDefault();
        handleZoom100();
      } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        handlePrevPage();
      } else if (event.key === 'ArrowRight' || event.key === 'PageDown') {
        handleNextPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openedPdf, pageCount]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>ArchPDF</h1>
        <p className="app-subtitle">建築・設計業務向けの軽量PDF編集ツール</p>
      </header>

      <Toolbar
        onOpenPdf={handleOpenPdf}
        isOpening={status === 'loading'}
        hasPdf={!!openedPdf}
        currentPage={currentPage}
        pageCount={pageCount}
        scale={scale}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoom100={handleZoom100}
        onFit={handleFit}
      />

      <main className="app-main">
        <PageThumbnails pdf={openedPdf} />
        <PdfViewer
          pdf={openedPdf}
          pdfDocument={pdfDocument}
          currentPage={currentPage}
          zoomMode={zoomMode}
          scale={scale}
          onFitScaleComputed={handleFitScaleComputed}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
        />
      </main>

      <StatusBar
        pdf={openedPdf}
        status={status}
        errorMessage={errorMessage}
        currentPage={currentPage}
        scale={scale}
        operationError={operationError}
      />
    </div>
  );
}

export default App;

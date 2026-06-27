import { useEffect, useRef, useState } from 'react';
import { renderFirstPage, PdfParseError } from '../../lib/pdfjs';
import type { PDFDocumentProxy } from '../../lib/pdfjs';
import type { OpenedPdf } from '../../types/pdf';

interface PdfViewerProps {
  pdf: OpenedPdf | null;
  pdfDocument: PDFDocumentProxy | null;
}

export function PdfViewer({ pdf, pdfDocument }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    setRenderError(null);

    if (!pdfDocument || !canvasRef.current) {
      return;
    }

    renderFirstPage(pdfDocument, canvasRef.current).catch((error) => {
      setRenderError(
        error instanceof PdfParseError ? error.message : 'PDFページの表示に失敗しました。'
      );
    });
  }, [pdfDocument]);

  if (!pdf || !pdfDocument) {
    return (
      <section className="pdf-viewer">
        <p>「PDFを開く」からPDFを読み込んでください（1ページ目のみ表示。全ページ表示は今後対応予定）</p>
      </section>
    );
  }

  return (
    <section className="pdf-viewer">
      <div className="pdf-viewer-page">
        {renderError ? (
          <p className="pdf-viewer-error">{renderError}</p>
        ) : (
          <canvas ref={canvasRef} className="pdf-viewer-canvas" />
        )}
      </div>
    </section>
  );
}

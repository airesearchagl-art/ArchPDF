import { useEffect, useRef, useState } from 'react';
import type { WheelEvent } from 'react';
import { renderPage, computeFitScale, PdfParseError } from '../../lib/pdfjs';
import type { PDFDocumentProxy } from '../../lib/pdfjs';
import type { OpenedPdf, ZoomMode } from '../../types/pdf';

interface PdfViewerProps {
  pdf: OpenedPdf | null;
  pdfDocument: PDFDocumentProxy | null;
  currentPage: number;
  zoomMode: ZoomMode;
  scale: number;
  onFitScaleComputed: (scale: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

/** 入力欄やcontenteditable要素にフォーカスがある場合、ホイールズームを無効化するための判定。 */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
}

export function PdfViewer({
  pdf,
  pdfDocument,
  currentPage,
  zoomMode,
  scale,
  onFitScaleComputed,
  onZoomIn,
  onZoomOut,
}: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    setRenderError(null);

    if (!pdfDocument || !canvasRef.current) {
      setIsRendering(false);
      return;
    }

    let cancelled = false;
    setIsRendering(true);

    (async () => {
      try {
        let effectiveScale = scale;
        if (zoomMode === 'fit') {
          const containerWidth = containerRef.current?.clientWidth ?? 0;
          effectiveScale = await computeFitScale(pdfDocument, currentPage, containerWidth);
          if (!cancelled) {
            onFitScaleComputed(effectiveScale);
          }
        }

        if (cancelled || !canvasRef.current) {
          return;
        }

        await renderPage(pdfDocument, currentPage, canvasRef.current, effectiveScale);
      } catch (error) {
        if (cancelled) {
          return;
        }
        setRenderError(
          error instanceof PdfParseError ? error.message : 'PDFページの表示に失敗しました。'
        );
      } finally {
        if (!cancelled) {
          setIsRendering(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfDocument, currentPage, zoomMode, scale]);

  const handleWheel = (event: WheelEvent<HTMLElement>) => {
    if (!event.ctrlKey) {
      return;
    }
    event.preventDefault();

    if (isEditableTarget(document.activeElement)) {
      return;
    }

    if (event.deltaY < 0) {
      onZoomIn();
    } else if (event.deltaY > 0) {
      onZoomOut();
    }
  };

  if (!pdf || !pdfDocument) {
    return (
      <section className="pdf-viewer" ref={containerRef} onWheel={handleWheel}>
        <p>「PDFを開く」からPDFを読み込んでください</p>
      </section>
    );
  }

  return (
    <section className="pdf-viewer" ref={containerRef} onWheel={handleWheel}>
      <div className="pdf-viewer-page">
        {renderError ? (
          <p className="pdf-viewer-error">{renderError}</p>
        ) : (
          <>
            {isRendering && <p className="pdf-viewer-loading">ページを読み込み中…</p>}
            <canvas ref={canvasRef} className="pdf-viewer-canvas" />
          </>
        )}
      </div>
    </section>
  );
}

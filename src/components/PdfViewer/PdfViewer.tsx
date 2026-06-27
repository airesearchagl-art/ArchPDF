import { useEffect, useRef, useState } from 'react';
import type { WheelEvent } from 'react';
import { renderPage, computeFitScale, PdfParseError, RenderTaskHandle } from '../../lib/pdfjs';
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
  const renderTaskRef = useRef<RenderTaskHandle | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    setRenderError(null);

    // 前回のrender taskが残っている場合はキャンセルし、ページ/ズーム切り替え時の描画競合を防ぐ。
    renderTaskRef.current?.cancel();

    if (!pdfDocument || !canvasRef.current) {
      renderTaskRef.current = null;
      setIsRendering(false);
      return;
    }

    const handle = new RenderTaskHandle();
    renderTaskRef.current = handle;
    setIsRendering(true);

    (async () => {
      try {
        let effectiveScale = scale;
        if (zoomMode === 'fit') {
          const containerWidth = containerRef.current?.clientWidth ?? 0;
          effectiveScale = await computeFitScale(pdfDocument, currentPage, containerWidth);
          if (handle.isCancelled()) {
            return;
          }
          onFitScaleComputed(effectiveScale);
        }

        if (handle.isCancelled() || !canvasRef.current) {
          return;
        }

        await renderPage(pdfDocument, currentPage, canvasRef.current, effectiveScale, handle);

        if (!handle.isCancelled()) {
          setIsRendering(false);
        }
      } catch (error) {
        if (handle.isCancelled()) {
          return;
        }
        setIsRendering(false);
        setRenderError(
          error instanceof PdfParseError ? error.message : 'PDFページの表示に失敗しました。'
        );
      }
    })();

    return () => {
      handle.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfDocument, currentPage, zoomMode, scale, retryToken]);

  const handleRetry = () => {
    setRetryToken((token) => token + 1);
  };

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
          <div className="pdf-viewer-error">
            <p>{renderError}</p>
            <button onClick={handleRetry}>再描画</button>
          </div>
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

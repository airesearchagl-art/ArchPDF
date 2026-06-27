import type { OpenedPdf, PdfOpenStatus } from '../../types/pdf';

interface StatusBarProps {
  pdf: OpenedPdf | null;
  status: PdfOpenStatus;
  errorMessage: string | null;
  currentPage: number;
  scale: number;
  operationError: string | null;
}

export function StatusBar({
  pdf,
  status,
  errorMessage,
  currentPage,
  scale,
  operationError,
}: StatusBarProps) {
  if (status === 'loading') {
    return <footer className="status-bar">PDFファイルを読み込み中です…</footer>;
  }

  if (status === 'error' && errorMessage) {
    return (
      <footer className="status-bar" style={{ color: '#c0392b' }}>
        {errorMessage}
      </footer>
    );
  }

  if (operationError) {
    return (
      <footer className="status-bar" style={{ color: '#c0392b' }}>
        {operationError}
      </footer>
    );
  }

  return (
    <footer className="status-bar">
      {pdf
        ? `${pdf.fileName}（${currentPage} / ${pdf.pageCount}ページ、${Math.round(scale * 100)}%）`
        : 'PDFが開かれていません'}
    </footer>
  );
}

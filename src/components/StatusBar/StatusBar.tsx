import type { OpenedPdf, PdfOpenStatus } from '../../types/pdf';

interface StatusBarProps {
  pdf: OpenedPdf | null;
  status: PdfOpenStatus;
  errorMessage: string | null;
}

export function StatusBar({ pdf, status, errorMessage }: StatusBarProps) {
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

  return (
    <footer className="status-bar">
      {pdf ? `${pdf.fileName}（全${pdf.pageCount}ページ）の1ページ目を表示しています` : 'PDFが開かれていません'}
    </footer>
  );
}

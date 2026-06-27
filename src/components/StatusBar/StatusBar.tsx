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
      {pdf ? `${pdf.fileName} を選択しました（PDF表示は未実装です）` : 'PDFが開かれていません'}
    </footer>
  );
}

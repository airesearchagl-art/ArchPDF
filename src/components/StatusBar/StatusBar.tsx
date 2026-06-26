import type { OpenedPdf } from '../../types/pdf';

interface StatusBarProps {
  pdf: OpenedPdf | null;
}

export function StatusBar({ pdf }: StatusBarProps) {
  return (
    <footer className="status-bar">
      {pdf ? `${pdf.fileName} (${pdf.pageCount} ページ)` : 'PDFが開かれていません'}
    </footer>
  );
}

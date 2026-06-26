import type { OpenedPdf } from '../../types/pdf';

interface PdfViewerProps {
  pdf: OpenedPdf | null;
}

export function PdfViewer({ pdf }: PdfViewerProps) {
  return (
    <section className="pdf-viewer">
      {pdf ? (
        <p>{pdf.fileName} の表示（未実装）</p>
      ) : (
        <p>「PDFを開く」からPDFを読み込んでください（PDF表示は未実装です）</p>
      )}
    </section>
  );
}

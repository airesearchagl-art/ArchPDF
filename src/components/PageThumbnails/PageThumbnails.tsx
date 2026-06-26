import type { OpenedPdf } from '../../types/pdf';

interface PageThumbnailsProps {
  pdf: OpenedPdf | null;
}

export function PageThumbnails({ pdf }: PageThumbnailsProps) {
  return (
    <aside className="page-thumbnails">
      {pdf ? (
        <p className="placeholder-note">ページ一覧（未実装: {pdf.pageCount}ページ）</p>
      ) : (
        <p className="placeholder-note">PDFを開くとページ一覧が表示されます（未実装）</p>
      )}
    </aside>
  );
}

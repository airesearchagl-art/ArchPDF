import type { OpenedPdf } from '../../types/pdf';

interface PageThumbnailsProps {
  pdf: OpenedPdf | null;
}

export function PageThumbnails({ pdf }: PageThumbnailsProps) {
  return (
    <aside className="page-thumbnails">
      {pdf ? (
        <p className="placeholder-note">全{pdf.pageCount}ページ（サムネイル一覧は今後対応予定）</p>
      ) : (
        <p className="placeholder-note">PDFを開くとページ数が表示されます</p>
      )}
    </aside>
  );
}

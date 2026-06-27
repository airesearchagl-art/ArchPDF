interface ToolbarProps {
  onOpenPdf: () => void;
  isOpening: boolean;
  hasPdf: boolean;
  currentPage: number;
  pageCount: number;
  scale: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoom100: () => void;
  onFit: () => void;
}

export function Toolbar({
  onOpenPdf,
  isOpening,
  hasPdf,
  currentPage,
  pageCount,
  scale,
  onPrevPage,
  onNextPage,
  onZoomIn,
  onZoomOut,
  onZoom100,
  onFit,
}: ToolbarProps) {
  return (
    <div className="toolbar">
      <button onClick={onOpenPdf} disabled={isOpening} title="PDFファイルを選択します">
        {isOpening ? 'PDFを開く（読み込み中…）' : 'PDFを開く'}
      </button>

      <span className="toolbar-separator" />

      <button onClick={onPrevPage} disabled={!hasPdf || currentPage <= 1} title="前のページ (ArrowLeft / PageUp)">
        前へ
      </button>
      <span className="toolbar-page-indicator">{hasPdf ? `${currentPage} / ${pageCount}` : '- / -'}</span>
      <button
        onClick={onNextPage}
        disabled={!hasPdf || currentPage >= pageCount}
        title="次のページ (ArrowRight / PageDown)"
      >
        次へ
      </button>

      <span className="toolbar-separator" />

      <button onClick={onZoomOut} disabled={!hasPdf} title="縮小 (Ctrl + -)">
        -
      </button>
      <span className="toolbar-zoom-indicator">{hasPdf ? `${Math.round(scale * 100)}%` : '-'}</span>
      <button onClick={onZoomIn} disabled={!hasPdf} title="拡大 (Ctrl + +)">
        +
      </button>
      <button onClick={onZoom100} disabled={!hasPdf} title="100%表示 (Ctrl + 0)">
        100%
      </button>
      <button onClick={onFit} disabled={!hasPdf} title="幅に合わせる">
        幅に合わせる
      </button>

      <span className="toolbar-separator" />

      <button disabled title="未実装">ページ回転（未実装）</button>
      <button disabled title="未実装">ページ削除（未実装）</button>
      <button disabled title="未実装">並べ替え（未実装）</button>
      <button disabled title="未実装">赤入れ（未実装）</button>
      <button disabled title="未実装">スタンプ（未実装）</button>
      <button disabled title="未実装">別名保存（未実装）</button>
    </div>
  );
}

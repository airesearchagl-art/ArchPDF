import { useEffect, useState } from 'react';
import type { KeyboardEvent } from 'react';

interface ToolbarProps {
  onOpenPdf: () => void;
  isOpening: boolean;
  hasPdf: boolean;
  currentPage: number;
  pageCount: number;
  scale: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onGoToPage: (pageNumber: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoom100: () => void;
  onFit: () => void;
}

/** ページ番号入力ジャンプUI。Enterで移動、Escapeで現在ページ表示に戻す。 */
function PageJumpInput({
  hasPdf,
  currentPage,
  pageCount,
  onGoToPage,
}: {
  hasPdf: boolean;
  currentPage: number;
  pageCount: number;
  onGoToPage: (pageNumber: number) => void;
}) {
  const [inputValue, setInputValue] = useState(String(currentPage));
  const [inputError, setInputError] = useState<string | null>(null);

  // 外部要因（前へ/次へ、ズーム操作後のページ変化等）でcurrentPageが変わったら入力欄を追従させる
  useEffect(() => {
    setInputValue(String(currentPage));
    setInputError(null);
  }, [currentPage]);

  const resetToCurrentPage = () => {
    setInputValue(String(currentPage));
    setInputError(null);
  };

  const commitInput = () => {
    const trimmed = inputValue.trim();
    if (trimmed === '') {
      resetToCurrentPage();
      return;
    }

    const parsed = Number(trimmed);
    if (!Number.isInteger(parsed)) {
      setInputError('ページ番号は整数で入力してください。');
      return;
    }

    if (parsed < 1 || parsed > pageCount) {
      setInputError(`ページ番号は1〜${pageCount}の範囲で入力してください。`);
      return;
    }

    setInputError(null);
    onGoToPage(parsed);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      commitInput();
    } else if (event.key === 'Escape') {
      resetToCurrentPage();
    }
  };

  return (
    <span className="toolbar-page-jump">
      <input
        type="text"
        inputMode="numeric"
        className="toolbar-page-jump-input"
        value={inputValue}
        disabled={!hasPdf || pageCount <= 1}
        onChange={(event) => setInputValue(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitInput}
        aria-label="ページ番号"
        title="ページ番号を入力してEnterで移動"
      />
      <span className="toolbar-page-jump-total">{hasPdf ? `/ ${pageCount}` : '/ -'}</span>
      {inputError && <span className="toolbar-page-jump-error">{inputError}</span>}
    </span>
  );
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
  onGoToPage,
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
      <PageJumpInput
        hasPdf={hasPdf}
        currentPage={currentPage}
        pageCount={pageCount}
        onGoToPage={onGoToPage}
      />
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

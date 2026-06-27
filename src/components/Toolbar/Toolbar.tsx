interface ToolbarProps {
  onOpenPdf: () => void;
  isOpening: boolean;
}

export function Toolbar({ onOpenPdf, isOpening }: ToolbarProps) {
  return (
    <div className="toolbar">
      <button onClick={onOpenPdf} disabled={isOpening} title="PDFファイルを選択します">
        {isOpening ? 'PDFを開く（読み込み中…）' : 'PDFを開く'}
      </button>
      <button disabled title="未実装">ページ回転（未実装）</button>
      <button disabled title="未実装">ページ削除（未実装）</button>
      <button disabled title="未実装">並べ替え（未実装）</button>
      <button disabled title="未実装">赤入れ（未実装）</button>
      <button disabled title="未実装">スタンプ（未実装）</button>
      <button disabled title="未実装">別名保存（未実装）</button>
    </div>
  );
}

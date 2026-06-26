interface ToolbarProps {
  onOpenPdf: () => void;
}

export function Toolbar({ onOpenPdf }: ToolbarProps) {
  return (
    <div className="toolbar">
      <button onClick={onOpenPdf} title="ファイル選択・読み込み処理は未接続です">
        PDFを開く（未接続）
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

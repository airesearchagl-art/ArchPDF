interface ToolbarProps {
  onOpenPdf: () => void;
}

export function Toolbar({ onOpenPdf }: ToolbarProps) {
  return (
    <div className="toolbar">
      <button onClick={onOpenPdf}>PDFを開く</button>
      <button disabled title="未実装">ページ回転</button>
      <button disabled title="未実装">ページ削除</button>
      <button disabled title="未実装">並べ替え</button>
      <button disabled title="未実装">赤入れ</button>
      <button disabled title="未実装">スタンプ</button>
      <button disabled title="未実装">別名保存</button>
    </div>
  );
}

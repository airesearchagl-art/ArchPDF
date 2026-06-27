/** PDFを開いた結果を表す最小限の型。PDF本文の解析は features/pdf-open の後続実装で行う。 */
export interface OpenedPdf {
  fileName: string;
  filePath: string;
  pageCount: number;
}

/** PDFファイル選択〜読み込みの状態。 */
export type PdfOpenStatus = 'idle' | 'loading' | 'error';

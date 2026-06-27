/** PDFを開いた結果を表す最小限の型。PDF本文の解析は features/pdf-open の後続実装で行う。 */
export interface OpenedPdf {
  fileName: string;
  filePath: string;
  pageCount: number;
}

/** PDFファイル選択〜読み込みの状態。 */
export type PdfOpenStatus = 'idle' | 'loading' | 'error';

/** ズーム表示モード。fit: 表示領域の幅に合わせる / custom: 手動指定のscaleを使う。 */
export type ZoomMode = 'fit' | 'custom';

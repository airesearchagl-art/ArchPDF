/** PDFを開いた結果を表す最小限の型。実処理は features/pdf-open で実装する。 */
export interface OpenedPdf {
  fileName: string;
  pageCount: number;
}

import type { OpenedPdf } from '../../types/pdf';

/**
 * PDFファイルを開く処理。
 * 未実装: ファイル選択ダイアログ（Tauri dialog API）とPDF.jsでの読み込みを後続タスクで実装する。
 */
export async function openPdfFile(): Promise<OpenedPdf | null> {
  // eslint-disable-next-line no-console
  console.warn('openPdfFile: PDF読み込みは未実装です。');
  return null;
}

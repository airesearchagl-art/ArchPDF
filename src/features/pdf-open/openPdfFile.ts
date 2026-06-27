import { open } from '@tauri-apps/api/dialog';
import type { OpenedPdf } from '../../types/pdf';

const PDF_EXTENSION = 'pdf';

/** ユーザーがPDF以外のファイルを選択した場合に投げるエラー。 */
export class InvalidPdfFileError extends Error {}

function extractFileName(filePath: string): string {
  const segments = filePath.split(/[\\/]/);
  return segments[segments.length - 1] ?? filePath;
}

/**
 * Tauri dialog APIでPDFファイルを選択する。
 * PDF本文の読み込み・解析（PDF.js連携）は後続タスクで実装する。
 *
 * @returns 選択されたPDFの情報。ユーザーがキャンセルした場合は null。
 * @throws {InvalidPdfFileError} PDF以外のファイルが選択された場合。
 */
export async function openPdfFile(): Promise<OpenedPdf | null> {
  const selected = await open({
    multiple: false,
    filters: [{ name: 'PDF', extensions: [PDF_EXTENSION] }],
  });

  if (selected === null) {
    return null;
  }

  const filePath = Array.isArray(selected) ? selected[0] : selected;

  if (!filePath.toLowerCase().endsWith(`.${PDF_EXTENSION}`)) {
    throw new InvalidPdfFileError('PDFファイルを選択してください。');
  }

  return {
    fileName: extractFileName(filePath),
    filePath,
    pageCount: 0,
  };
}

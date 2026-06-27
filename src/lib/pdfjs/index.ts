import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
// ?url によりワーカーをローカルにバンドルし、CDN参照を避ける。
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

/** PDFの解析（破損PDF・PDF.js初期化失敗）に失敗した場合に投げるエラー。 */
export class PdfParseError extends Error {}

/** 表示領域の目標幅。大判（A1/A3）図面でも無制限の高解像度描画を避けるための基準値。 */
const TARGET_RENDER_WIDTH = 800;
/** 小さいページを過剰に拡大しないための上限スケール。 */
const MAX_RENDER_SCALE = 2;

export type { PDFDocumentProxy };

/**
 * PDFバイナリを解析し、PDF.jsのドキュメントを取得する。
 * @throws {PdfParseError} 破損PDFやPDF.js初期化失敗の場合。
 */
export async function parsePdf(data: Uint8Array): Promise<PDFDocumentProxy> {
  try {
    return await pdfjsLib.getDocument({ data }).promise;
  } catch {
    throw new PdfParseError(
      'PDFの解析に失敗しました。ファイルが破損しているか、PDF.jsの初期化に失敗した可能性があります。'
    );
  }
}

/**
 * PDFドキュメントの1ページ目をcanvasに描画する。
 * 大判図面PDFを想定し、目標表示幅に収まるスケールに制限して描画する。
 * @throws {PdfParseError} ページ取得・描画に失敗した場合。
 */
export async function renderFirstPage(
  doc: PDFDocumentProxy,
  canvas: HTMLCanvasElement
): Promise<void> {
  try {
    const page = await doc.getPage(1);
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = Math.min(TARGET_RENDER_WIDTH / baseViewport.width, MAX_RENDER_SCALE);
    const viewport = page.getViewport({ scale });

    const context = canvas.getContext('2d');
    if (!context) {
      throw new PdfParseError('Canvas描画コンテキストを取得できませんでした。');
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context, viewport }).promise;
  } catch (error) {
    if (error instanceof PdfParseError) {
      throw error;
    }
    throw new PdfParseError('PDFページの描画に失敗しました。');
  }
}

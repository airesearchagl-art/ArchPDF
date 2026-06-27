import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
// ?url によりワーカーをローカルにバンドルし、CDN参照を避ける。
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

/** PDFの解析・ページ取得・描画に失敗した場合に投げるエラー。 */
export class PdfParseError extends Error {}

/** ズーム倍率の下限・上限。大判図面PDFでの無制限な高倍率レンダリングを避けるための制限。 */
export const MIN_SCALE = 0.5;
export const MAX_SCALE = 3.0;
/** 幅に合わせる表示で許容する最大倍率。手動ズームの上限よりも控えめに制限する。 */
export const FIT_MAX_SCALE = 2.0;

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
 * 指定ページのスケール1.0時点の幅・高さを取得する。幅に合わせる表示のスケール計算に使う。
 * @throws {PdfParseError} ページ取得に失敗した場合。
 */
export async function getPageBaseSize(
  doc: PDFDocumentProxy,
  pageNumber: number
): Promise<{ width: number; height: number }> {
  try {
    const page = await doc.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 });
    return { width: viewport.width, height: viewport.height };
  } catch {
    throw new PdfParseError('PDFページの取得に失敗しました。');
  }
}

/**
 * 表示領域の幅に合わせたスケールを計算する。失敗時は1.0にフォールバックする。
 */
export async function computeFitScale(
  doc: PDFDocumentProxy,
  pageNumber: number,
  containerWidth: number
): Promise<number> {
  try {
    if (!containerWidth || containerWidth <= 0) {
      return 1.0;
    }
    const { width } = await getPageBaseSize(doc, pageNumber);
    if (!width) {
      return 1.0;
    }
    const computed = containerWidth / width;
    return Math.min(Math.max(computed, MIN_SCALE), FIT_MAX_SCALE);
  } catch {
    return 1.0;
  }
}

/**
 * 指定ページを指定スケールでcanvasに描画する。表示中の1ページのみをレンダリングし、
 * 前の描画内容はcanvasのサイズ変更により破棄される。
 * @throws {PdfParseError} ページ番号が範囲外、またはページ取得・描画に失敗した場合。
 */
export async function renderPage(
  doc: PDFDocumentProxy,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale: number
): Promise<void> {
  if (pageNumber < 1 || pageNumber > doc.numPages) {
    throw new PdfParseError('指定されたページ番号が範囲外です。');
  }

  try {
    const page = await doc.getPage(pageNumber);
    const clampedScale = Math.min(Math.max(scale, MIN_SCALE), MAX_SCALE);
    const viewport = page.getViewport({ scale: clampedScale });

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

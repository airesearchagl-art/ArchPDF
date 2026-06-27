# ArchPDF

建築・設計業務向けの軽量PDF編集デスクトップアプリです。

> **ArchPDFはAdobe Acrobatの完全代替ではありません。**
> 建築図面PDFの確認・整理・ページ操作・簡易な書き込みを、軽く・速く行うことを目的としたツールです。

## 概要

- 建築・設計の実務でよく使う「PDFを開いて、ページを見て、整理して、ちょっと書き込む」という操作に特化します。
- PDF本文（既存テキストオブジェクト）の直接編集は対象外です。
- まずはページ単位の操作（閲覧・サムネイル・削除・並べ替え・回転）を中心としたMVPから始めます。

## 対象ユーザー

- 建築設計者、設計事務所、図面PDFを日常的に扱う実務者

## 初期MVPのスコープ

### MVPで対応するもの

- PDFの読み込み・閲覧
- ページサムネイル表示
- ページ削除
- ページ並べ替え
- ページ回転

### 将来拡張として構成のみ用意するもの（未実装）

- PDF結合・分割
- テキスト追記
- 画像貼り付け
- スタンプ
- 赤入れ（簡易注釈）

### MVPで対応しないもの

- PDF本文（既存テキスト）の直接編集
- Adobe Acrobat相当の高度な編集機能全般

## 技術構成

| 分野 | 採用技術 |
|---|---|
| デスクトップアプリ基盤 | [Tauri](https://tauri.app/) |
| フロントエンド | React + TypeScript |
| PDF表示 | [PDF.js](https://mozilla.github.io/pdf.js/) |
| PDF加工 | [pdf-lib](https://pdf-lib.js.org/) |
| 対象OS | Windows（優先） |
| パッケージ管理 | npm |

## セットアップ手順

### 前提条件

- Node.js 18以上
- Rust（Tauriのビルドに必要。 https://www.rust-lang.org/tools/install ）
- npm

### インストール

```bash
npm install
```

## 開発コマンド

```bash
# フロントエンドのみ開発サーバーで起動
npm run dev

# Tauriアプリとして開発起動（Rustツールチェーンが必要）
npm run tauri dev

# Lint
npm run lint

# 型チェック
npm run typecheck

# ビルド（フロントエンド）
npm run build

# Tauriアプリのビルド（インストーラー生成）
npm run tauri build
```

## セキュリティ方針

- PDFファイルは原則として**ローカル処理**のみとし、外部サーバーへ送信しません。
- 建築図面など機密性の高いPDFを扱うことを前提に設計します。
- 不要な外部通信（解析SDK、外部API呼び出し等）は追加しません。
- APIキー・トークン・個人情報は本リポジトリに含めません。
- 依存ライブラリはCDN経由ではなく、npm経由でバンドルすることを基本とします。
- PDF加工機能を実装する際は、**元PDFを直接上書きせず、別名保存を基本方針とします**。元ファイルの破壊を防ぐためです。

## 未実装機能

現時点では以下は未実装です。今後のマイルストーンで段階的に対応します。

- **PDF本文の表示・解析処理（ファイル選択は実装済みですが、PDF.jsによる実表示・ページ解析は未接続です）**
- ページサムネイル生成
- ページ削除・並べ替え・回転の実処理
- PDF結合・分割
- テキスト追記・画像貼り付け・スタンプ・赤入れ
- 別名保存・書き出し
- Windowsインストーラー配布
- **Windows環境でのTauriネイティブアプリ実機起動確認**（後述「確認済み環境」を参照。現時点ではLinuxサンドボックスでのフロントエンド検証のみで、Windows実機での `npm run tauri dev` / `npm run tauri build` は未実施です）

## 既知の課題（npm audit）

`npm install` 時点で `npm audit` を実行すると、以下の脆弱性が報告されます（2026-06-27確認時点）。

| パッケージ | 深刻度 | 経路 | 状態 |
|---|---|---|---|
| `esbuild` (<=0.24.2、`vite`経由の間接依存) | moderate | devDependencies | `npm audit fix --force`でvite 8系へのメジャーアップグレードが必要（破壊的変更のため今回は未対応） |
| `minimatch` (9.0.0-9.0.6、`@typescript-eslint/*`経由の間接依存) | high | devDependencies | `@typescript-eslint`のメジャーアップグレードが必要なため`npm audit fix`では解決せず、今回は未対応 |

- いずれも**devDependencies（開発時のみ使用）の間接依存**であり、配布するアプリ本体（`dist`/Tauriバンドル）には含まれません。
- ただし、**本番配布前には`@typescript-eslint`系・`vite`のメジャーアップグレードを検討し、破壊的変更の影響を確認した上で対応必須**です。
- 現時点で即時修正可能な非破壊的な`npm audit fix`はありません（実行済み、変化なし）。

## 確認済み環境

2026-06-27時点で実施した確認内容です。

| 確認内容 | 環境 | 結果 |
|---|---|---|
| `npm install` | Windows実機 | pass |
| `npm run lint` | Windows実機 | pass |
| `npm run typecheck` | Windows実機 | 本PR反映前は `App.tsx` と `Toolbar.tsx`/`StatusBar.tsx` のProps不整合により失敗していたが、本PRの修正により解消（Linuxサンドボックスで再確認しpass） |
| `npm run build` | Windows実機 | 本PR反映前は上記typecheckエラーにより失敗していたが、本PRの修正により解消（Linuxサンドボックスで再確認しpass、`dist`生成） |
| `npm run tauri dev` | Windows実機 | 本PR反映前は `src-tauri/icons/icon.ico` が存在せずRustビルド時にエラーとなり失敗していたが、`src-tauri/icons/` 配下にアイコン一式を追加し解消。Linuxサンドボックスでは `webkit2gtk`未導入・GUI表示環境なしのため実起動確認は**未実施** |
| `npm run tauri build` | Linuxサンドボックス | **未実施**（理由は上記と同様） |
| コード上の不要な外部通信の有無 | ソースコード読査 | pass（`src/`, `src-tauri/src/` 配下に `fetch`/`axios`/`XMLHttpRequest`/外部URL呼び出しは存在しません） |

**`npm run tauri dev` / `npm run tauri build` の実機起動・目視確認（アプリウィンドウ表示、初期画面、PDFを開くボタン、未実装表示、コンソールエラーの有無）は、本PRのアイコン追加後にWindows環境を持つ開発者の方が再実行して確認する必要があります。**

## ロードマップ（概要）

1. v0.1: アプリ起動、PDF読み込み、基本UI
2. v0.2: ページサムネイル、ページ回転、ページ削除
3. v0.3: ページ並べ替え、別名保存
4. v0.4以降: テキスト追記、画像貼り付け、スタンプ、赤入れ、結合・分割、書き出し、配布

## ディレクトリ構成

```
src/
├─ components/      # UIコンポーネント（PdfViewer, PageThumbnails, Toolbar, StatusBar）
├─ features/        # 機能単位のロジック（pdf-open, page-operations, annotations）
├─ lib/             # 外部ライブラリのラッパー（pdfjs, pdflib）
└─ types/           # 型定義
```

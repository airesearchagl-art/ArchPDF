# scripts

## verify-windows.ps1

Windowsローカルでのビルド・動作確認をまとめて実行するPowerShellスクリプトです。

### 基本的な使い方

現在のブランチで `git status` 確認 + `npm install` + `lint` + `typecheck` + `build` を実行します。

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify-windows.ps1
```

`package.json` のショートカットからも実行できます。

```powershell
npm run verify:windows
```

### ブランチを指定して確認する

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify-windows.ps1 -Branch feature/pdf-first-page-viewer
```

`origin` からfetchし、対象ブランチへcheckout（ローカルにない場合は `origin/<Branch>` から作成）、`git pull origin <Branch>` まで実行します。

### 作業ツリーがdirtyな場合

デフォルトでは停止します。`-AutoStash` を指定した場合のみ自動で `git stash push -u` を実行します（stash popは自動実行されません。確認後に戻すかどうかはユーザーが判断してください）。

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify-windows.ps1 -Branch feature/pdf-first-page-viewer -AutoStash
```

### Tauriアプリの起動確認まで行う

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify-windows.ps1 -RunTauriDev
```

または `package.json` のショートカット（現在のブランチでdev/buildの両方を実行）。

```powershell
npm run verify:windows:full
```

`-RunTauriDev` 実行時はアプリウィンドウを目視確認してください（起動・PDFを開くボタン・ファイル選択・1ページ目表示・コンソールエラーの有無）。

### インストーラー生成まで確認する

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify-windows.ps1 -RunTauriBuild
```

成功後、`src-tauri/target/release/bundle/msi/` と `src-tauri/target/release/bundle/nsis/` の存在を確認して表示します。

### 全部まとめて実行する例

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify-windows.ps1 -Branch feature/pdf-first-page-viewer -AutoStash -RunTauriDev -RunTauriBuild
```

### ログ

実行結果は `logs/windows-verification/` 配下にタイムスタンプ付きで保存されます。PDFファイルパスやPDF内容はログに出力しません。

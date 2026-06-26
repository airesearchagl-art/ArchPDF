// すべての処理はローカルで行い、PDFを外部サーバーへ送信しない方針とする。
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running ArchPDF");
}

mod commands;
mod config;
mod img_proc;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            let _ = app.get_webview_window("main");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::process_image,
            commands::batch_process,
            commands::get_settings,
            commands::save_settings,
            commands::export_results,
            commands::get_image_info,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

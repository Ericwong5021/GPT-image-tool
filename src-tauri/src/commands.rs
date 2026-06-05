use crate::config::AppConfig;
use crate::img_proc;
use image::GenericImageView;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessOptions {
    pub remove_bg: bool,
    pub bg_color: Option<(u8, u8, u8)>,
    pub crop_width: Option<u32>,
    pub crop_height: Option<u32>,
    pub auto_slice: bool,
    pub output_format: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImageInfo {
    pub width: u32,
    pub height: u32,
    pub format: String,
    pub file_size: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessResult {
    pub success: bool,
    pub output_path: Option<String>,
    pub slices: Vec<String>,
    pub base64: Option<String>,
    pub error: Option<String>,
}

#[tauri::command]
pub fn process_image(
    input_path: String,
    output_dir: Option<String>,
    options: ProcessOptions,
) -> Result<ProcessResult, String> {
    let img = image::open(&input_path).map_err(|e| e.to_string())?;
    let config = AppConfig::load();

    let mut result_img = img.clone();

    if options.remove_bg {
        result_img = img_proc::remove_background(&result_img, config.remove_bg_threshold);
    }

    if let Some(color) = options.bg_color {
        result_img = img_proc::change_background(&result_img, color);
    }

    if let (Some(w), Some(h)) = (options.crop_width, options.crop_height) {
        result_img = img_proc::crop_image(&result_img, w, h);
    }

    let out_dir = output_dir
        .or(config.output_dir.clone())
        .unwrap_or_else(|| {
            let mut p = PathBuf::from(&input_path);
            p.pop();
            p.push("output");
            std::fs::create_dir_all(&p).ok();
            p.to_string_lossy().to_string()
        });

    let input_name = PathBuf::from(&input_path)
        .file_stem()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_else(|| "output".to_string());

    let ext = match options.output_format.to_lowercase().as_str() {
        "jpg" | "jpeg" => "jpg",
        _ => "png",
    };

    let mut slice_paths: Vec<String> = Vec::new();
    if options.auto_slice {
        let slices = img_proc::auto_slice(&result_img, config.slice_sensitivity);
        for (i, slice) in slices.iter().enumerate() {
            let slice_path = format!("{}/{}_slice_{}.{}", out_dir, input_name, i, ext);
            let slice_encoded = img_proc::encode_image(slice, &options.output_format)?;
            std::fs::write(&slice_path, &slice_encoded).map_err(|e| e.to_string())?;
            slice_paths.push(slice_path);
        }
    }

    let output_path = format!("{}/{}_processed.{}", out_dir, input_name, ext);
    let encoded = img_proc::encode_image(&result_img, &options.output_format)?;
    std::fs::write(&output_path, &encoded).map_err(|e| e.to_string())?;

    let base64 = base64::Engine::encode(
        &base64::engine::general_purpose::STANDARD,
        &encoded,
    );

    Ok(ProcessResult {
        success: true,
        output_path: Some(output_path),
        slices: slice_paths,
        base64: Some(format!("data:image/{};base64,{}", ext, base64)),
        error: None,
    })
}

#[tauri::command]
pub fn batch_process(
    input_paths: Vec<String>,
    output_dir: Option<String>,
    options: ProcessOptions,
) -> Result<Vec<ProcessResult>, String> {
    input_paths
        .iter()
        .map(|path| process_image(path.clone(), output_dir.clone(), options.clone()))
        .collect()
}

#[tauri::command]
pub fn get_settings() -> Result<AppConfig, String> {
    Ok(AppConfig::load())
}

#[tauri::command]
pub fn save_settings(config: AppConfig) -> Result<(), String> {
    config.save().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn export_results(
    base64_data: String,
    output_path: String,
    _format: String,
) -> Result<(), String> {
    let data = if base64_data.contains(",") {
        base64_data.split(',').nth(1).unwrap_or(&base64_data)
    } else {
        &base64_data
    };

    let bytes = base64::Engine::decode(
        &base64::engine::general_purpose::STANDARD,
        data,
    )
    .map_err(|e| e.to_string())?;

    std::fs::write(&output_path, &bytes).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_image_info(path: String) -> Result<ImageInfo, String> {
    let img = image::open(&path).map_err(|e| e.to_string())?;
    let (width, height) = img.dimensions();
    let metadata = std::fs::metadata(&path).map_err(|e| e.to_string())?;

    let format = img_proc::get_format_name(&img);

    Ok(ImageInfo {
        width,
        height,
        format: format.to_string(),
        file_size: metadata.len(),
    })
}

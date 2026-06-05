use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub output_format: String,
    pub output_dir: Option<String>,
    pub remove_bg_threshold: u8,
    pub bg_color: BgColor,
    pub slice_sensitivity: f32,
    pub max_batch_size: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BgColor {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            output_format: "png".to_string(),
            output_dir: None,
            remove_bg_threshold: 30,
            bg_color: BgColor { r: 255, g: 255, b: 255 },
            slice_sensitivity: 0.5,
            max_batch_size: 50,
        }
    }
}

impl AppConfig {
    pub fn config_path() -> PathBuf {
        let mut path = dirs::config_dir().unwrap_or_else(|| PathBuf::from("."));
        path.push("auto-cut-tool");
        std::fs::create_dir_all(&path).ok();
        path.push("config.json");
        path
    }

    pub fn load() -> Self {
        let path = Self::config_path();
        if path.exists() {
            let data = std::fs::read_to_string(&path).unwrap_or_default();
            serde_json::from_str(&data).unwrap_or_default()
        } else {
            let config = Self::default();
            config.save().ok();
            config
        }
    }

    pub fn save(&self) -> Result<(), Box<dyn std::error::Error>> {
        let path = Self::config_path();
        let data = serde_json::to_string_pretty(self)?;
        std::fs::write(path, data)?;
        Ok(())
    }
}

import { invoke } from "@tauri-apps/api/core";
import { isAbsolute } from "@tauri-apps/api/path";

export interface ProcessOptions {
  remove_bg: boolean;
  bg_color: [number, number, number] | null;
  crop_width: number | null;
  crop_height: number | null;
  auto_slice: boolean;
  output_format: string;
}

export interface ProcessResult {
  success: boolean;
  output_path: string | null;
  slices: string[];
  base64: string | null;
  error: string | null;
}

export interface ImageInfo {
  width: number;
  height: number;
  format: string;
  file_size: number;
}

export interface AppConfig {
  output_format: string;
  output_dir: string | null;
  remove_bg_threshold: number;
  bg_color: { r: number; g: number; b: number };
  slice_sensitivity: number;
  max_batch_size: number;
}

async function assertAbsolutePath(path: string, fieldName: string) {
  if (!(await isAbsolute(path))) {
    throw new Error(`${fieldName} must be an absolute filesystem path: ${path}`);
  }
}

export async function processImage(
  inputPath: string,
  outputDir: string | null,
  options: ProcessOptions,
): Promise<ProcessResult> {
  await assertAbsolutePath(inputPath, "inputPath");

  return invoke<ProcessResult>("process_image", {
    inputPath,
    outputDir,
    options,
  });
}

export async function batchProcess(
  inputPaths: string[],
  outputDir: string | null,
  options: ProcessOptions,
): Promise<ProcessResult[]> {
  await Promise.all(
    inputPaths.map((inputPath) => assertAbsolutePath(inputPath, "inputPath")),
  );

  return invoke<ProcessResult[]>("batch_process", {
    inputPaths,
    outputDir,
    options,
  });
}

export async function getSettings(): Promise<AppConfig> {
  return invoke<AppConfig>("get_settings");
}

export async function saveSettings(config: AppConfig): Promise<void> {
  return invoke("save_settings", { config });
}

export async function exportResults(
  base64Data: string,
  outputPath: string,
  format: string,
): Promise<void> {
  return invoke("export_results", { base64Data, outputPath, format });
}

export async function getImageInfo(path: string): Promise<ImageInfo> {
  return invoke<ImageInfo>("get_image_info", { path });
}

use image::{DynamicImage, Rgba, RgbaImage};
use image::GenericImageView;

/// Remove background from image based on color similarity to top-left corner pixel.
pub fn remove_background(img: &DynamicImage, threshold: u8) -> DynamicImage {
    let rgba = img.to_rgba8();
    let (width, height) = rgba.dimensions();

    let bg_pixel = rgba.get_pixel(0, 0);
    let bg_r = bg_pixel[0];
    let bg_g = bg_pixel[1];
    let bg_b = bg_pixel[2];

    let mut result = RgbaImage::new(width, height);

    for y in 0..height {
        for x in 0..width {
            let pixel = rgba.get_pixel(x, y);
            let r = pixel[0];
            let g = pixel[1];
            let b = pixel[2];

            let diff = (r as u16).abs_diff(bg_r as u16)
                + (g as u16).abs_diff(bg_g as u16)
                + (b as u16).abs_diff(bg_b as u16);

            if diff > threshold as u16 {
                result.put_pixel(x, y, *pixel);
            } else {
                result.put_pixel(x, y, Rgba([0, 0, 0, 0]));
            }
        }
    }

    DynamicImage::ImageRgba8(result)
}

/// Change background color of image (assumes transparent background).
pub fn change_background(
    img: &DynamicImage,
    new_bg: (u8, u8, u8),
) -> DynamicImage {
    let rgba = img.to_rgba8();
    let (width, height) = rgba.dimensions();
    let mut result = RgbaImage::new(width, height);

    for y in 0..height {
        for x in 0..width {
            let pixel = rgba.get_pixel(x, y);
            if pixel[3] == 0 {
                result.put_pixel(x, y, Rgba([new_bg.0, new_bg.1, new_bg.2, 255]));
            } else {
                result.put_pixel(x, y, *pixel);
            }
        }
    }

    DynamicImage::ImageRgba8(result)
}

/// Crop image to specified dimensions from center.
pub fn crop_image(
    img: &DynamicImage,
    target_width: u32,
    target_height: u32,
) -> DynamicImage {
    let (w, h) = img.dimensions();
    let x = (w.saturating_sub(target_width)) / 2;
    let y = (h.saturating_sub(target_height)) / 2;
    img.crop_imm(x, y, target_width.min(w), target_height.min(h))
}

/// Simple auto-slice: detect connected non-transparent regions and extract them.
pub fn auto_slice(img: &DynamicImage, sensitivity: f32) -> Vec<DynamicImage> {
    let rgba = img.to_rgba8();
    let (width, height) = rgba.dimensions();

    let alpha_threshold = ((1.0 - sensitivity) * 255.0) as u8;

    let mut visited = vec![false; (width * height) as usize];
    let mut slices = Vec::new();

    for y in 0..height {
        for x in 0..width {
            let idx = (y * width + x) as usize;
            if visited[idx] {
                continue;
            }

            let pixel = rgba.get_pixel(x, y);
            if pixel[3] <= alpha_threshold {
                visited[idx] = true;
                continue;
            }

            // BFS to find connected component
            let mut component = Vec::new();
            let mut queue = std::collections::VecDeque::new();
            queue.push_back((x, y));
            visited[idx] = true;

            let mut min_x = x;
            let mut max_x = x;
            let mut min_y = y;
            let mut max_y = y;

            while let Some((cx, cy)) = queue.pop_front() {
                component.push((cx, cy));
                min_x = min_x.min(cx);
                max_x = max_x.max(cx);
                min_y = min_y.min(cy);
                max_y = max_y.max(cy);

                for (dx, dy) in &[(0i32, 1i32), (0, -1), (1, 0), (-1, 0)] {
                    let nx = cx as i32 + dx;
                    let ny = cy as i32 + dy;
                    if nx >= 0 && nx < width as i32 && ny >= 0 && ny < height as i32 {
                        let nx = nx as u32;
                        let ny = ny as u32;
                        let nidx = (ny * width + nx) as usize;
                        if !visited[nidx] {
                            let np = rgba.get_pixel(nx, ny);
                            if np[3] > alpha_threshold {
                                visited[nidx] = true;
                                queue.push_back((nx, ny));
                            }
                        }
                    }
                }
            }

            if component.len() > 10 {
                // Minimum size filter
                let slice_w = max_x - min_x + 1;
                let slice_h = max_y - min_y + 1;
                let cropped = img.crop_imm(min_x, min_y, slice_w, slice_h);
                slices.push(cropped);
            }
        }
    }

    slices
}

/// Encode image to bytes in specified format.
pub fn encode_image(img: &DynamicImage, format: &str) -> Result<Vec<u8>, String> {
    let mut buf = std::io::Cursor::new(Vec::new());

    match format.to_lowercase().as_str() {
        "png" => {
            img.write_to(&mut buf, image::ImageFormat::Png)
                .map_err(|e| e.to_string())?;
        }
        "jpg" | "jpeg" => {
            img.write_to(&mut buf, image::ImageFormat::Jpeg)
                .map_err(|e| e.to_string())?;
        }
        _ => {
            return Err(format!("Unsupported format: {}", format));
        }
    }

    Ok(buf.into_inner())
}

/// Get a human-readable format name for an image.
pub fn get_format_name(img: &DynamicImage) -> &'static str {
    match img {
        DynamicImage::ImageLuma8(_) => "Luma",
        DynamicImage::ImageLumaA8(_) => "LumaA",
        DynamicImage::ImageRgb8(_) => "Rgb",
        DynamicImage::ImageRgba8(_) => "Rgba",
        _ => "Unknown",
    }
}

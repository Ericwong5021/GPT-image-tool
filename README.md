# GPT Image Tool

AI-driven image cutting and background removal tool with cross-platform GUI support (Windows & macOS).

## Features

- **Background Removal** — Automatically detect and remove image backgrounds based on color similarity
- **Background Color Change** — Replace transparent backgrounds with custom colors
- **Image Cropping** — Crop images to specified dimensions from center
- **Auto Slice** — Detect and extract connected non-transparent regions as separate images
- **Export** — Save processed images in PNG or JPG format
- **Batch Processing** — Process multiple images at once with progress tracking

## Tech Stack

- **Backend:** Rust (Tauri v2)
- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Image Processing:** `image` crate (Rust)

## Development

### Prerequisites

- [Bun](https://bun.sh/) (package manager)
- [Rust](https://www.rust-lang.org/tools/install) (for Tauri backend)
- [Tauri Prerequisites](https://v2.tauri.app/start/prerequisites/)

### Setup

```bash
bun install
```

### Run in Development

```bash
bun run tauri dev
```

### Build for Production

```bash
bun run tauri build
```

## Project Structure

```
GPT-image-tool/
├── src-tauri/          # Rust backend
│   ├── src/
│   │   ├── main.rs     # Entry point
│   │   ├── lib.rs      # Tauri app builder
│   │   ├── commands.rs # IPC commands
│   │   ├── img_proc.rs # Image processing logic
│   │   └── config.rs   # App configuration
│   ├── Cargo.toml
│   └── tauri.conf.json
├── src/                # React frontend
│   ├── App.tsx
│   ├── main.tsx
│   ├── components/     # UI components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Tauri IPC wrappers
│   └── styles/         # Global CSS
├── package.json
└── vite.config.ts
```

## License

MIT

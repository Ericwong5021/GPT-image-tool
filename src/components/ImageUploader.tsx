import { useCallback, useEffect, useState } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { basename } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import type { ImageImport } from "../hooks/useImageProcess";

interface ImageUploaderProps {
  onImagesAdded: (images: ImageImport[]) => void;
}

const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg"]);

function isSupportedImagePath(path: string) {
  const ext = path.split(".").pop()?.toLowerCase();
  return ext ? IMAGE_EXTENSIONS.has(ext) : false;
}

async function toImageImport(path: string): Promise<ImageImport> {
  return {
    path,
    name: await basename(path),
    previewUrl: convertFileSrc(path),
  };
}

export function ImageUploader({ onImagesAdded }: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);

  const addImagePaths = useCallback(
    async (paths: string[]) => {
      const imagePaths = paths.filter(isSupportedImagePath);
      if (imagePaths.length === 0) return;

      const images = await Promise.all(imagePaths.map(toImageImport));
      onImagesAdded(images);
    },
    [onImagesAdded],
  );

  const handleSelectImages = useCallback(async () => {
    const selected = await open({
      multiple: true,
      directory: false,
      filters: [
        {
          name: "Image",
          extensions: Array.from(IMAGE_EXTENSIONS),
        },
      ],
    });

    if (Array.isArray(selected)) {
      await addImagePaths(selected);
    } else if (selected) {
      await addImagePaths([selected]);
    }
  }, [addImagePaths]);

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    getCurrentWebview()
      .onDragDropEvent(async (event) => {
        switch (event.payload.type) {
          case "enter":
          case "over":
            setDragActive(true);
            break;
          case "drop":
            setDragActive(false);
            await addImagePaths(event.payload.paths);
            break;
          case "leave":
            setDragActive(false);
            break;
        }
      })
      .then((cleanup) => {
        unlisten = cleanup;
      })
      .catch((error) => {
        console.warn("Failed to listen for Tauri drag/drop events", error);
      });

    return () => {
      unlisten?.();
    };
  }, [addImagePaths]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <button
        type="button"
        className={`w-full max-w-lg border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
          dragActive
            ? "border-primary-500 bg-primary-50 drag-active"
            : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
        }`}
        onClick={handleSelectImages}
      >
        <div className="text-6xl mb-4">📸</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          拖拽图片到此处
        </h3>
        <p className="text-sm text-gray-500 mb-4">或点击选择文件</p>
        <p className="text-xs text-gray-400">支持 PNG, JPG, JPEG 格式</p>
      </button>
    </div>
  );
}

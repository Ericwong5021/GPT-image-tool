import { useState, useCallback } from "react";
import {
  processImage,
  type ProcessOptions,
  type ProcessResult,
} from "../lib/tauri";

export interface ImageImport {
  /** Absolute filesystem path returned by Tauri dialog or drag/drop. */
  path: string;
  name: string;
  previewUrl: string;
}

interface ImageFile {
  id: string;
  name: string;
  /** Absolute filesystem path used only for the backend process_image command. */
  path: string;
  previewUrl: string;
  result?: ProcessResult;
  status: "pending" | "processing" | "done" | "error";
}

export function useImageProcess() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const addImages = useCallback((imports: ImageImport[]) => {
    const newImages: ImageFile[] = imports.map((image) => ({
      id: crypto.randomUUID(),
      name: image.name,
      path: image.path,
      previewUrl: image.previewUrl,
      status: "pending" as const,
    }));
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img?.previewUrl.startsWith("blob:")) URL.revokeObjectURL(img.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const clearImages = useCallback(() => {
    setImages((prev) => {
      prev.forEach((img) => {
        if (img?.previewUrl.startsWith("blob:")) URL.revokeObjectURL(img.previewUrl);
      });
      return [];
    });
  }, []);

  const processAll = useCallback(
    async (options: ProcessOptions) => {
      setProcessing(true);
      const pending = images.filter((i) => i.status === "pending");
      setProgress({ current: 0, total: pending.length });

      for (let i = 0; i < pending.length; i++) {
        const img = pending[i];
        setImages((prev) =>
          prev.map((item) =>
            item.id === img.id ? { ...item, status: "processing" } : item,
          ),
        );
        setProgress({ current: i + 1, total: pending.length });

        try {
          const result = await processImage(img.path, null, options);
          setImages((prev) =>
            prev.map((item) =>
              item.id === img.id
                ? { ...item, result, status: result.success ? "done" : "error" }
                : item,
            ),
          );
        } catch (error) {
          setImages((prev) =>
            prev.map((item) =>
              item.id === img.id
                ? {
                    ...item,
                    status: "error",
                    result: {
                      success: false,
                      error: String(error),
                      output_path: null,
                      slices: [],
                      base64: null,
                    },
                  }
                : item,
            ),
          );
        }
      }

      setProcessing(false);
    },
    [images],
  );

  const processSingle = useCallback(
    async (id: string, options: ProcessOptions) => {
      const img = images.find((i) => i.id === id);
      if (!img) return;

      setImages((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "processing" } : item,
        ),
      );

      try {
        const result = await processImage(img.path, null, options);
        setImages((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, result, status: result.success ? "done" : "error" }
              : item,
          ),
        );
      } catch (error) {
        setImages((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: "error",
                  result: {
                    success: false,
                    error: String(error),
                    output_path: null,
                    slices: [],
                    base64: null,
                  },
                }
              : item,
          ),
        );
      }
    },
    [images],
  );

  return {
    images,
    processing,
    progress,
    addImages,
    removeImage,
    clearImages,
    processAll,
    processSingle,
  };
}

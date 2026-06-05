import { useState, useCallback } from "react";
import {
  processImage,
  batchProcess,
  type ProcessOptions,
  type ProcessResult,
} from "../lib/tauri";

interface ImageFile {
  id: string;
  file: File;
  path: string;
  preview: string;
  result?: ProcessResult;
  status: "pending" | "processing" | "done" | "error";
}

export function useImageProcess() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const addImages = useCallback((files: File[]) => {
    const newImages: ImageFile[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      path: (file as unknown as { path?: string }).path || file.name,
      preview: URL.createObjectURL(file),
      status: "pending" as const,
    }));
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const clearImages = useCallback(() => {
    setImages((prev) => {
      prev.forEach((img) => URL.revokeObjectURL(img.preview));
      return [];
    });
  }, []);

  const processAll = useCallback(
    async (options: ProcessOptions) => {
      setProcessing(true);
      const pending = images.filter((i) => i.status === "pending");
      setProgress({ current: 0, total: pending.length });

      // Mark all as processing
      setImages((prev) =>
        prev.map((item) =>
          item.status === "pending" ? { ...item, status: "processing" as const } : item,
        ),
      );

      try {
        const paths = pending.map((img) => img.path);
        const results = await batchProcess(paths, null, options);

        setImages((prev) =>
          prev.map((item) => {
            const idx = pending.findIndex((p) => p.id === item.id);
            if (idx === -1) return item;
            const result = results[idx];
            return {
              ...item,
              result,
              status: result?.success ? "done" : "error",
            };
          }),
        );
      } catch (error) {
        setImages((prev) =>
          prev.map((item) =>
            item.status === "processing"
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

      setProgress({ current: pending.length, total: pending.length });
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
          item.id === id ? { ...item, status: "processing" as const } : item,
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

import { useCallback, useState, useRef } from "react";

interface ImageUploaderProps {
  onImagesAdded: (files: File[]) => void;
}

export function ImageUploader({ onImagesAdded }: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (files.length > 0) {
        onImagesAdded(files);
      }
    },
    [onImagesAdded],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        onImagesAdded(files);
      }
      if (inputRef.current) inputRef.current.value = "";
    },
    [onImagesAdded],
  );

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div
        className={`w-full max-w-lg border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
          dragActive
            ? "border-primary-500 bg-primary-50 drag-active"
            : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <div className="text-6xl mb-4">📸</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          拖拽图片到此处
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          或点击选择文件
        </p>
        <p className="text-xs text-gray-400">
          支持 PNG, JPG, JPEG 格式
        </p>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/jpg"
          className="hidden"
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

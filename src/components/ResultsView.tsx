import { useCallback } from "react";
import { exportResults } from "../lib/tauri";

interface ResultImage {
  id: string;
  file: File;
  preview: string;
  result?: {
    base64?: string | null;
    output_path?: string | null;
    error?: string | null;
    success: boolean;
  };
  status: string;
}

interface ResultsViewProps {
  images: ResultImage[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ResultsView({ images, selectedId, onSelect }: ResultsViewProps) {
  const completedImages = images.filter((img) => img.status === "done" && img.result?.base64);

  const handleExport = useCallback(async (img: ResultImage) => {
    if (!img.result?.base64) return;

    const ext = img.result.output_path?.split(".").pop() || "png";
    const name = img.file.name.replace(/\.[^.]+$/, `_processed.${ext}`);

    try {
      await exportResults(img.result.base64, name, ext);
      alert(`已导出: ${name}`);
    } catch (error) {
      alert(`导出失败: ${error}`);
    }
  }, []);

  const handleExportAll = useCallback(async () => {
    for (const img of completedImages) {
      await handleExport(img);
    }
  }, [completedImages, handleExport]);

  if (completedImages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <div className="text-5xl mb-3">🖼️</div>
        <p>暂无处理结果</p>
        <p className="text-sm mt-1">请先处理图片</p>
      </div>
    );
  }

  const selected = images.find((img) => img.id === selectedId);

  return (
    <div className="flex h-full gap-4">
      {/* Results Grid */}
      <div className="flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">
            处理结果 ({completedImages.length})
          </h3>
          <button
            onClick={handleExportAll}
            className="px-3 py-1.5 text-xs font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            全部导出
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 overflow-y-auto max-h-[calc(100vh-200px)]">
          {completedImages.map((img) => (
            <div
              key={img.id}
              className={`relative group rounded-lg overflow-hidden border-2 cursor-pointer image-grid-item ${
                selectedId === img.id
                  ? "border-primary-500"
                  : "border-transparent hover:border-gray-300"
              }`}
              onClick={() => onSelect(img.id)}
            >
              <img
                src={img.result!.base64!}
                alt={img.file.name}
                className="w-full h-24 object-contain bg-gray-50"
              />

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleExport(img);
                }}
                className="absolute bottom-1 right-1 px-2 py-0.5 bg-primary-600 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                导出
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Panel */}
      {selected?.result?.base64 && (
        <div className="w-80 bg-white rounded-xl border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">预览</h4>
          <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
            <img
              src={selected.result.base64}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="mt-3 space-y-1">
            <p className="text-xs text-gray-500 truncate">
              文件: {selected.file.name}
            </p>
            {selected.result.output_path && (
              <p className="text-xs text-gray-500 truncate">
                路径: {selected.result.output_path}
              </p>
            )}
          </div>
          <button
            onClick={() => handleExport(selected)}
            className="w-full mt-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
          >
            导出此图片
          </button>
        </div>
      )}
    </div>
  );
}

import type { ProcessOptions } from "../lib/tauri";

interface BatchProcessorProps {
  images: Array<{
    id: string;
    file: File;
    status: string;
    result?: { success: boolean; error?: string | null };
  }>;
  processing: boolean;
  progress: { current: number; total: number };
  options: ProcessOptions;
  onOptionsChange: (options: ProcessOptions) => void;
  onProcessAll: () => void;
  onClear: () => void;
}

export function BatchProcessor({
  images,
  processing,
  progress,
  options,
  onOptionsChange,
  onProcessAll,
  onClear,
}: BatchProcessorProps) {
  const pending = images.filter((i) => i.status === "pending").length;
  const completed = images.filter((i) => i.status === "done").length;
  const failed = images.filter((i) => i.status === "error").length;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">批量处理</h2>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "总数量", value: images.length, color: "text-gray-700" },
          { label: "待处理", value: pending, color: "text-yellow-600" },
          { label: "已完成", value: completed, color: "text-green-600" },
          { label: "失败", value: failed, color: "text-red-600" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-4 border border-gray-200 text-center"
          >
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      {processing && (
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">处理进度</span>
            <span className="text-sm font-medium text-primary-600">
              {progress.current}/{progress.total}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
              style={{
                width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Quick Settings */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 space-y-4">
        <h3 className="text-sm font-medium text-gray-700">快速设置</h3>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={options.remove_bg}
              onChange={(e) =>
                onOptionsChange({ ...options, remove_bg: e.target.checked })
              }
              className="w-4 h-4 text-primary-600 rounded"
            />
            <span className="text-sm text-gray-700">去除背景</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={options.auto_slice}
              onChange={(e) =>
                onOptionsChange({ ...options, auto_slice: e.target.checked })
              }
              className="w-4 h-4 text-primary-600 rounded"
            />
            <span className="text-sm text-gray-700">自动切图</span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">格式:</span>
            <select
              value={options.output_format}
              onChange={(e) =>
                onOptionsChange({
                  ...options,
                  output_format: e.target.value,
                })
              }
              className="px-2 py-1 text-sm border rounded"
            >
              <option value="png">PNG</option>
              <option value="jpg">JPG</option>
            </select>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onProcessAll}
          disabled={processing || pending === 0}
          className={`flex-1 py-3 rounded-xl font-semibold text-white transition-all ${
            processing || pending === 0
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-primary-600 hover:bg-primary-700 active:scale-[0.98]"
          }`}
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="spinner" />
              批量处理中...
            </span>
          ) : (
            `开始批量处理 (${pending} 张待处理)`
          )}
        </button>

        <button
          onClick={onClear}
          disabled={processing}
          className="px-6 py-3 rounded-xl font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          清空列表
        </button>
      </div>

      {/* File List */}
      {images.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            {images.map((img, idx) => (
              <div
                key={img.id}
                className={`flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 last:border-0 ${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                }`}
              >
                <span className="text-sm text-gray-400 w-6">{idx + 1}</span>
                <span className="text-sm text-gray-700 flex-1 truncate">
                  {img.file.name}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    img.status === "done"
                      ? "bg-green-100 text-green-700"
                      : img.status === "error"
                        ? "bg-red-100 text-red-700"
                        : img.status === "processing"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {img.status === "done"
                    ? "✓ 完成"
                    : img.status === "error"
                      ? "✗ 失败"
                      : img.status === "processing"
                        ? "处理中"
                        : "待处理"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

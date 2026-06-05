import type { ProcessOptions } from "../lib/tauri";

interface ProcessingPanelProps {
  options: ProcessOptions;
  onOptionsChange: (options: ProcessOptions) => void;
  onProcess: () => void;
  processing: boolean;
  imageCount: number;
}

export function ProcessingPanel({
  options,
  onOptionsChange,
  onProcess,
  processing,
  imageCount,
}: ProcessingPanelProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">处理控制面板</h2>

      <div className="bg-white rounded-xl p-5 border border-gray-200 space-y-5">
        {/* Background Removal */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.remove_bg}
              onChange={(e) =>
                onOptionsChange({ ...options, remove_bg: e.target.checked })
              }
              className="w-4 h-4 text-primary-600 rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              去除背景
            </span>
          </label>
          {options.remove_bg && (
            <div className="ml-7 text-xs text-gray-500">
              自动检测并移除图片背景（基于颜色相似度）
            </div>
          )}
        </div>

        {/* Background Color */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.bg_color !== null}
              onChange={(e) =>
                onOptionsChange({
                  ...options,
                  bg_color: e.target.checked ? [255, 255, 255] : null,
                })
              }
              className="w-4 h-4 text-primary-600 rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              背景变色
            </span>
          </label>
          {options.bg_color && (
            <div className="ml-7 flex items-center gap-3">
              <input
                type="color"
                value={`#${options.bg_color.map((c) => c.toString(16).padStart(2, "0")).join("")}`}
                onChange={(e) => {
                  const hex = e.target.value.slice(1);
                  const r = parseInt(hex.slice(0, 2), 16);
                  const g = parseInt(hex.slice(2, 4), 16);
                  const b = parseInt(hex.slice(4, 6), 16);
                  onOptionsChange({ ...options, bg_color: [r, g, b] });
                }}
                className="w-8 h-8 rounded border cursor-pointer"
              />
              <span className="text-xs text-gray-500">选择背景颜色</span>
            </div>
          )}
        </div>

        {/* Crop */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.crop_width !== null}
              onChange={(e) =>
                onOptionsChange({
                  ...options,
                  crop_width: e.target.checked ? 512 : null,
                  crop_height: e.target.checked ? 512 : null,
                })
              }
              className="w-4 h-4 text-primary-600 rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              尺寸裁剪
            </span>
          </label>
          {options.crop_width !== null && (
            <div className="ml-7 flex items-center gap-3">
              <input
                type="number"
                value={options.crop_width || 0}
                onChange={(e) =>
                  onOptionsChange({
                    ...options,
                    crop_width: parseInt(e.target.value) || null,
                  })
                }
                className="w-20 px-2 py-1 text-sm border rounded"
                placeholder="宽"
              />
              <span className="text-gray-400">×</span>
              <input
                type="number"
                value={options.crop_height || 0}
                onChange={(e) =>
                  onOptionsChange({
                    ...options,
                    crop_height: parseInt(e.target.value) || null,
                  })
                }
                className="w-20 px-2 py-1 text-sm border rounded"
                placeholder="高"
              />
              <span className="text-xs text-gray-500">px</span>
            </div>
          )}
        </div>

        {/* Auto Slice */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={options.auto_slice}
              onChange={(e) =>
                onOptionsChange({ ...options, auto_slice: e.target.checked })
              }
              className="w-4 h-4 text-primary-600 rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              自动切图
            </span>
          </label>
          {options.auto_slice && (
            <div className="ml-7 text-xs text-gray-500">
              自动检测并分离图片中的独立元素
            </div>
          )}
        </div>

        {/* Output Format */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            输出格式
          </label>
          <div className="flex gap-3">
            {["png", "jpg"].map((fmt) => (
              <label
                key={fmt}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                  options.output_format === fmt
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="format"
                  value={fmt}
                  checked={options.output_format === fmt}
                  onChange={() =>
                    onOptionsChange({ ...options, output_format: fmt })
                  }
                  className="hidden"
                />
                <span className="text-sm font-medium uppercase">{fmt}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Process Button */}
      <button
        onClick={onProcess}
        disabled={processing || imageCount === 0}
        className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${
          processing || imageCount === 0
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-primary-600 hover:bg-primary-700 active:scale-[0.98]"
        }`}
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <span className="spinner" />
            处理中...
          </span>
        ) : (
          `开始处理 (${imageCount} 张图片)`
        )}
      </button>
    </div>
  );
}

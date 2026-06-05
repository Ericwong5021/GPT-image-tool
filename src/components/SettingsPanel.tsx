import { useState, useEffect } from "react";
import { getSettings, saveSettings, type AppConfig } from "../lib/tauri";

export function SettingsPanel() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getSettings()
      .then(setConfig)
      .catch(() => {
        setConfig({
          output_format: "png",
          output_dir: null,
          remove_bg_threshold: 30,
          bg_color: { r: 255, g: 255, b: 255 },
          slice_sensitivity: 0.5,
          max_batch_size: 50,
        });
      });
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await saveSettings(config);
      setMessage("设置已保存");
      setTimeout(() => setMessage(""), 2000);
    } catch (error) {
      setMessage(`保存失败: ${error}`);
    } finally {
      setSaving(false);
    }
  };

  if (!config) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-lg font-semibold text-gray-800">设置</h2>

      <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-6">
        {/* Output Format */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            默认输出格式
          </label>
          <select
            value={config.output_format}
            onChange={(e) =>
              setConfig({ ...config, output_format: e.target.value })
            }
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="png">PNG</option>
            <option value="jpg">JPG</option>
          </select>
        </div>

        {/* Output Directory */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            默认输出目录
          </label>
          <input
            type="text"
            value={config.output_dir || ""}
            onChange={(e) =>
              setConfig({
                ...config,
                output_dir: e.target.value || null,
              })
            }
            placeholder="留空则输出到原图同目录"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* BG Removal Threshold */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            背景去除阈值: {config.remove_bg_threshold}
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={config.remove_bg_threshold}
            onChange={(e) =>
              setConfig({
                ...config,
                remove_bg_threshold: parseInt(e.target.value),
              })
            }
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>低 (更严格)</span>
            <span>高 (更宽松)</span>
          </div>
        </div>

        {/* Slice Sensitivity */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            切图灵敏度: {(config.slice_sensitivity * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={config.slice_sensitivity * 100}
            onChange={(e) =>
              setConfig({
                ...config,
                slice_sensitivity: parseInt(e.target.value) / 100,
              })
            }
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>低 (大块)</span>
            <span>高 (细碎)</span>
          </div>
        </div>

        {/* Max Batch Size */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            批量处理上限
          </label>
          <input
            type="number"
            min="1"
            max="500"
            value={config.max_batch_size}
            onChange={(e) =>
              setConfig({
                ...config,
                max_batch_size: parseInt(e.target.value) || 50,
              })
            }
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "保存中..." : "保存设置"}
        </button>
        {message && (
          <span
            className={`text-sm ${
              message.includes("失败") ? "text-red-600" : "text-green-600"
            }`}
          >
            {message}
          </span>
        )}
      </div>
    </div>
  );
}

import { useState, useCallback } from "react";
import { Sidebar } from "./components/Sidebar";
import { ImageUploader } from "./components/ImageUploader";
import { ImagePreview } from "./components/ImagePreview";
import { ProcessingPanel } from "./components/ProcessingPanel";
import { ResultsView } from "./components/ResultsView";
import { BatchProcessor } from "./components/BatchProcessor";
import { SettingsPanel } from "./components/SettingsPanel";
import { useImageProcess } from "./hooks/useImageProcess";
import type { ProcessOptions } from "./lib/tauri";

const defaultOptions: ProcessOptions = {
  remove_bg: true,
  bg_color: null,
  crop_width: null,
  crop_height: null,
  auto_slice: false,
  output_format: "png",
};

function App() {
  const [activeTab, setActiveTab] = useState("upload");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [options, setOptions] = useState<ProcessOptions>(defaultOptions);

  const {
    images,
    processing,
    progress,
    addImages,
    removeImage,
    clearImages,
    processAll,
  } = useImageProcess();

  const handleProcess = useCallback(() => {
    processAll(options);
  }, [processAll, options]);

  const renderContent = () => {
    switch (activeTab) {
      case "upload":
        return (
          <div className="flex flex-col h-full">
            <ImageUploader onImagesAdded={addImages} />
            {images.length > 0 && (
              <div className="p-4 border-t border-gray-200">
                <ImagePreview
                  images={images}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onRemove={removeImage}
                />
              </div>
            )}
          </div>
        );

      case "process":
        return (
          <div className="flex flex-col h-full">
            <div className="flex-1 p-6 overflow-y-auto">
              <ProcessingPanel
                options={options}
                onOptionsChange={setOptions}
                onProcess={handleProcess}
                processing={processing}
                imageCount={images.filter((i) => i.status === "pending").length}
              />
            </div>
            {images.length > 0 && (
              <div className="p-4 border-t border-gray-200">
                <ImagePreview
                  images={images}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onRemove={removeImage}
                />
              </div>
            )}
          </div>
        );

      case "results":
        return (
          <div className="p-6 h-full">
            <ResultsView
              images={images}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
        );

      case "batch":
        return (
          <div className="p-6 h-full overflow-y-auto">
            <BatchProcessor
              images={images}
              processing={processing}
              progress={progress}
              options={options}
              onOptionsChange={setOptions}
              onProcessAll={handleProcess}
              onClear={clearImages}
            />
          </div>
        );

      case "settings":
        return (
          <div className="p-6 h-full overflow-y-auto">
            <SettingsPanel />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 flex flex-col overflow-hidden">{renderContent()}</main>
    </div>
  );
}

export default App;

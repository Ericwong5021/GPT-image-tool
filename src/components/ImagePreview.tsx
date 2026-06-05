interface ImagePreviewProps {
  images: Array<{
    id: string;
    preview: string;
    file: File;
    status: string;
    result?: {
      base64?: string | null;
      output_path?: string | null;
      error?: string | null;
    };
  }>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

export function ImagePreview({
  images,
  selectedId,
  onSelect,
  onRemove,
}: ImagePreviewProps) {
  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        <p>暂无图片</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">
        已添加 {images.length} 张图片
      </h3>

      <div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto p-1">
        {images.map((img) => (
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
              src={img.preview}
              alt={img.file.name}
              className="w-full h-20 object-cover"
            />

            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(img.id);
              }}
              className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              ×
            </button>

            {img.status === "done" && (
              <div className="absolute bottom-1 left-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
            {img.status === "error" && (
              <div className="absolute bottom-1 left-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">!</span>
              </div>
            )}
            {img.status === "processing" && (
              <div className="absolute bottom-1 left-1 spinner" />
            )}

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
              <p className="text-white text-xs truncate">{img.file.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

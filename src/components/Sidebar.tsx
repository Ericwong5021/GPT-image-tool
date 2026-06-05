interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "upload", label: "上传图片", icon: "📁" },
  { id: "process", label: "处理控制", icon: "⚙️" },
  { id: "results", label: "处理结果", icon: "🖼️" },
  { id: "batch", label: "批量处理", icon: "📦" },
  { id: "settings", label: "设置", icon: "🔧" },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="w-56 bg-white border-r border-gray-200 flex flex-col h-screen">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span className="text-2xl">✂️</span>
          GPT Image Tool
        </h1>
        <p className="text-xs text-gray-500 mt-1">自动切图工具</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-primary-50 text-primary-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-400 text-center">v0.1.0</p>
      </div>
    </aside>
  );
}

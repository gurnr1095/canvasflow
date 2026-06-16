import { useCanvasStore } from '../../stores/canvas.store';

interface Props {
  onSave: () => void;
  isSaving: boolean;
  onOpenPalette: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function CanvasToolbar({ onSave, isSaving, onOpenPalette, onToggleSidebar, isSidebarOpen }: Props) {
  const { addNoteNode, addWorkflowNode, clearCanvas, nodes, edges } = useCanvasStore();

  return (
    <div
      data-toolbar
      className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-dark-panel/90 border border-dark-border rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] px-3 py-2 backdrop-blur-md select-none font-sans max-w-[calc(100vw-2rem)] overflow-x-auto"
    >
      {/* Sidebar Toggle */}
      <button
        onClick={onToggleSidebar}
        className={`shrink-0 p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-neutral-200 transition-colors ${
          isSidebarOpen ? 'text-accent-cyan bg-neutral-900' : ''
        }`}
        title="Toggle Left Sidebar"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="w-px h-5 bg-dark-border shrink-0" />

      {/* Command Palette Mock Input — shrinks on small screens */}
      <button
        onClick={onOpenPalette}
        className="flex items-center gap-2 bg-neutral-950/70 hover:bg-neutral-950 border border-dark-border px-3 py-1.5 rounded-lg text-left text-neutral-500 hover:text-neutral-400 transition-all w-36 sm:w-48 md:w-56 text-xs shrink-0"
      >
        <span className="truncate">Search commands...</span>
        <kbd className="ml-auto text-[9px] font-mono bg-neutral-900 border border-dark-border px-1.5 py-0.5 rounded text-neutral-500 font-normal shrink-0">
          ⌘K
        </kbd>
      </button>

      <div className="w-px h-5 bg-dark-border shrink-0" />

      {/* Manual node creators — labels hidden on xs */}
      <button
        onClick={() => addNoteNode(Math.random() * 200 + 100, Math.random() * 200 + 100)}
        className="shrink-0 px-2 py-1.5 text-xs text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1 font-medium"
        title="Add Note"
      >
        <span>📝</span>
        <span className="hidden sm:inline">+ Note</span>
      </button>

      <button
        onClick={() => addWorkflowNode(Math.random() * 200 + 100, Math.random() * 200 + 100)}
        className="shrink-0 px-2 py-1.5 text-xs text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1 font-medium"
        title="Add Workflow Node"
      >
        <span>⚙️</span>
        <span className="hidden sm:inline">+ Node</span>
      </button>

      <div className="w-px h-5 bg-dark-border shrink-0" />

      {/* Save Button */}
      <button
        onClick={onSave}
        disabled={isSaving}
        className="shrink-0 px-3 py-1.5 bg-neutral-100 hover:bg-white text-dark-bg text-xs font-semibold rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1"
      >
        {isSaving ? (
          <>
            <span className="w-2 h-2 rounded-full bg-accent-blue animate-ping" />
            <span className="hidden sm:inline">Saving...</span>
          </>
        ) : (
          <span>💾 Save</span>
        )}
      </button>

      <div className="w-px h-5 bg-dark-border shrink-0" />

      {/* Clear Button */}
      <button
        onClick={() => {
          if (confirm('Clear entire canvas?')) clearCanvas();
        }}
        disabled={nodes.length === 0}
        className="shrink-0 p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-950/20 rounded-lg disabled:opacity-30 transition-colors"
        title="Clear Canvas"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {/* Info Badge — hidden on smallest screens */}
      <div className="hidden xs:block shrink-0 text-[10px] font-mono bg-neutral-900 border border-dark-border px-2 py-1 rounded-lg text-neutral-400">
        {nodes.length}N : {edges.length}E
      </div>
    </div>
  );
}
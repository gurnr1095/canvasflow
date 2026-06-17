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
      className="absolute top-4 left-1/2 z-20 flex w-[calc(100vw-1rem)] max-w-[980px] -translate-x-1/2 flex-wrap items-center justify-center gap-2 rounded-2xl border border-dark-border/80 bg-dark-panel/85 px-3 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.65)] backdrop-blur-xl select-none font-sans"
    >
      {/* Sidebar Toggle */}
      <button
        onClick={onToggleSidebar}
        className={`shrink-0 rounded-xl p-1.5 transition-all ${
          isSidebarOpen
            ? 'bg-accent-cyan/10 text-accent-cyan'
            : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
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
        className="flex w-36 shrink-0 items-center gap-2 rounded-xl border border-dark-border bg-neutral-950/75 px-3 py-1.5 text-left text-xs text-neutral-500 transition-all hover:bg-neutral-950 hover:text-neutral-300 sm:w-48 md:w-56"
      >
        <span className="truncate">Search commands...</span>
        <kbd className="ml-auto shrink-0 rounded-md border border-dark-border bg-neutral-900 px-1.5 py-0.5 text-[9px] font-mono text-neutral-500">
          ⌘K
        </kbd>
      </button>

      <div className="w-px h-5 bg-dark-border shrink-0" />

      {/* Manual node creators — labels hidden on xs */}
      <button
        onClick={() => addNoteNode(Math.random() * 200 + 100, Math.random() * 200 + 100)}
        className="flex shrink-0 items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-neutral-100"
        title="Add Note"
      >
        <span>📝</span>
        <span className="hidden sm:inline">+ Note</span>
      </button>

      <button
        onClick={() => addWorkflowNode(Math.random() * 200 + 100, Math.random() * 200 + 100)}
        className="flex shrink-0 items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-neutral-100"
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
        className="flex shrink-0 items-center gap-1 rounded-xl bg-gradient-to-r from-white to-neutral-200 px-3 py-1.5 text-xs font-semibold text-dark-bg transition-all hover:from-accent-cyan hover:to-white disabled:opacity-50"
      >
        {isSaving ? (
          <>
            <span className="h-2 w-2 animate-ping rounded-full bg-accent-blue" />
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
      <div className="hidden shrink-0 rounded-xl border border-dark-border bg-neutral-900/80 px-2.5 py-1 text-[10px] font-mono text-neutral-400 xs:block">
        {nodes.length}N · {edges.length}E
      </div>
    </div>
  );
}
import { useState } from 'react';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useCanvasStore, undoCanvas, redoCanvas, useTemporalCanvas } from '../../stores/canvas.store';

interface Props {
  onSave: () => void;
  isSaving: boolean;
  onOpenPalette: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function CanvasToolbar({ onSave, isSaving, onOpenPalette, onToggleSidebar, isSidebarOpen }: Props) {
  const { addNoteNode, addWorkflowNode, clearCanvas, nodes, edges } = useCanvasStore();
  const temporal = useTemporalCanvas();
  const canUndo = temporal?.pastStates?.length > 0;
  const canRedo = temporal?.futureStates?.length > 0;
  const [collapsed, setCollapsed] = useState(false);

  const handleExport = async () => {
    const el = document.querySelector('.react-flow') as HTMLElement;
    if (!el) return;
    const toastId = toast.loading('Exporting…');
    try {
      const dataUrl = await toPng(el, { backgroundColor: '#0D1117', cacheBust: true });
      const link = document.createElement('a');
      link.download = 'canvasflow-export.png';
      link.href = dataUrl;
      link.click();
      toast.success('Canvas exported as PNG', { id: toastId });
    } catch {
      toast.error('Export failed', { id: toastId });
    }
  };

  return (
    <div
      data-toolbar
      className="fixed top-[4.5rem] left-1/2 z-20 -translate-x-1/2"
    >
      <AnimatePresence mode="wait" initial={false}>
        {collapsed ? (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.88 }}
            transition={{ duration: 0.15 }}
            onClick={() => setCollapsed(false)}
            title="Show toolbar"
            className="flex items-center gap-1.5 rounded-2xl border border-dark-border/80 bg-dark-panel/85 px-3 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.65)] backdrop-blur-xl text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.15 }}
            className="flex w-auto items-center gap-2 rounded-2xl border border-dark-border/80 bg-dark-panel/85 px-3 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.65)] backdrop-blur-xl select-none font-sans"
          >
            {/* Sidebar Toggle */}
            <button
              onClick={onToggleSidebar}
              className={`shrink-0 rounded-xl p-1.5 transition-all ${
                isSidebarOpen
                  ? 'bg-accent-cyan/10 text-accent-cyan'
                  : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
              }`}
              title="Toggle Sidebar"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="w-px h-5 bg-dark-border shrink-0" />

            {/* Search */}
            <button
              onClick={onOpenPalette}
              className="flex w-36 shrink-0 items-center gap-2 rounded-xl border border-dark-border bg-neutral-950/75 px-3 py-1.5 text-left text-xs text-neutral-500 transition-all hover:bg-neutral-950 hover:text-neutral-300 sm:w-48"
            >
              <span className="truncate">Search commands...</span>
              <kbd className="ml-auto shrink-0 rounded-md border border-dark-border bg-neutral-900 px-1.5 py-0.5 text-[9px] font-mono text-neutral-500">⌘K</kbd>
            </button>

            <div className="w-px h-5 bg-dark-border shrink-0" />

            {/* Undo / Redo */}
            <button
              onClick={undoCanvas}
              disabled={!canUndo}
              title="Undo (⌘Z)"
              className="shrink-0 rounded-xl p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 0 1 8 8v2M3 10l6-6M3 10l6 6" />
              </svg>
            </button>
            <button
              onClick={redoCanvas}
              disabled={!canRedo}
              title="Redo (⌘⇧Z)"
              className="shrink-0 rounded-xl p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 10H11a8 8 0 0 0-8 8v2M21 10l-6-6M21 10l-6 6" />
              </svg>
            </button>

            <div className="w-px h-5 bg-dark-border shrink-0" />

            {/* Add Note / Node */}
            <button
              onClick={() => addNoteNode(Math.random() * 200 + 100, Math.random() * 200 + 100)}
              className="flex shrink-0 items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-neutral-100"
              title="Add Note"
            >
              <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
              <span className="hidden sm:inline">+ Note</span>
            </button>

            <button
              onClick={() => addWorkflowNode(Math.random() * 200 + 100, Math.random() * 200 + 100)}
              className="flex shrink-0 items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-neutral-100"
              title="Add Node"
            >
              <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>
              <span className="hidden sm:inline">+ Node</span>
            </button>

            <div className="w-px h-5 bg-dark-border shrink-0" />

            {/* Save */}
            <button
              onClick={onSave}
              disabled={isSaving}
              className="flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-white to-neutral-200 px-3 py-1.5 text-xs font-semibold text-dark-bg transition-all hover:from-accent-cyan hover:to-white disabled:opacity-50"
            >
              {isSaving ? (
                <><span className="h-2 w-2 animate-ping rounded-full bg-accent-blue" /><span className="hidden sm:inline">Saving…</span></>
              ) : (
                <><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3m-1 4-3 3m0 0-3-3m3 3V4"/></svg><span>Save</span></>
              )}
            </button>

            {/* Export */}
            <button
              onClick={handleExport}
              title="Export as PNG"
              className="shrink-0 rounded-xl p-1.5 text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-4-4 4m0 0-4-4m4 4V4"/></svg>
            </button>

            <div className="w-px h-5 bg-dark-border shrink-0" />

            {/* Clear */}
            <button
              onClick={() => { if (confirm('Clear entire canvas?')) clearCanvas(); }}
              disabled={nodes.length === 0}
              className="shrink-0 p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-950/20 rounded-lg disabled:opacity-30 transition-colors"
              title="Clear Canvas"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>

            {/* Node/edge count */}
            <div className="hidden shrink-0 rounded-xl border border-dark-border bg-neutral-900/80 px-2.5 py-1 text-[10px] font-mono text-neutral-400 xs:block">
              {nodes.length}N · {edges.length}E
            </div>

            <div className="w-px h-5 bg-dark-border shrink-0" />

            {/* Collapse */}
            <button
              onClick={() => setCollapsed(true)}
              title="Hide toolbar"
              className="shrink-0 rounded-xl p-1.5 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

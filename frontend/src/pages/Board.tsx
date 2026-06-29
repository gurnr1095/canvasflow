import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import { UserButton } from '@clerk/clerk-react';
import { toast } from 'sonner';
import { boardsApi } from '../lib/api';
import type { BoardDetail } from '../types/canvas.types';
import { useCanvasStore, undoCanvas, redoCanvas } from '../stores/canvas.store';
import { useAIGenerate } from '../hooks/useAIGenerate';
import CanvasEditor from '../components/canvas/CanvasEditor';
import Sidebar from '../components/ui/Sidebar';
import CommandPalette from '../components/ui/CommandPalette';
import ContextPanel from '../components/ui/ContextPanel';
import { AnimatePresence } from 'framer-motion';

export default function Board() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { loadCanvas, nodes, edges } = useCanvasStore();
  const { generate } = useAIGenerate();

  const [board, setBoard] = useState<BoardDetail | null>(null);
  const [isLoadingBoard, setIsLoadingBoard] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved'>('saved');
  const isInitialLoad = useRef(true);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    if (!boardId) return;
    setIsLoadingBoard(true);
    isInitialLoad.current = true;

    boardsApi.get(boardId)
      .then((b) => {
        setBoard(b);
        const { nodes: n, edges: e } = b.canvas_data ?? { nodes: [], edges: [] };
        loadCanvas(n, e);
        setTimeout(() => { isInitialLoad.current = false; }, 100);
      })
      .catch(() => setBoard(null))
      .finally(() => setIsLoadingBoard(false));
  }, [boardId]);

  useEffect(() => {
    if (!isLoadingBoard && board && location.state?.autoGeneratePrompt) {
      const prompt = location.state.autoGeneratePrompt;
      navigate(location.pathname, { replace: true, state: {} });
      generate(prompt);
    }
  }, [isLoadingBoard, board, location.state]);

  const handleSave = useCallback(async (silent = false) => {
    if (!boardId) return;
    setIsSaving(true);
    try {
      await boardsApi.saveCanvas(boardId, nodes, edges);
      setSaveStatus('saved');
      if (!silent) toast.success('Saved', { duration: 1500 });
    } catch {
      toast.error('Save failed — try again');
    } finally {
      setIsSaving(false);
    }
  }, [boardId, nodes, edges]);

  const handleSaveRef = useRef(handleSave);
  useEffect(() => { handleSaveRef.current = handleSave; }, [handleSave]);

  // Mark unsaved + auto-save with 2s debounce
  useEffect(() => {
    if (isInitialLoad.current) return;
    setSaveStatus('unsaved');
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => handleSaveRef.current(true), 2000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [nodes, edges]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redoCanvas();
        else undoCanvas();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        redoCanvas();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave]);

  const hasSelectedNode = nodes.some((n) => n.selected);

  return (
    <ReactFlowProvider>
      <div className="w-screen h-screen flex flex-col text-neutral-200 overflow-hidden font-sans select-none">

        <header className="h-14 bg-dark-bg border-b border-dark-border flex items-center px-6 gap-4 shrink-0 z-10">
          <button
            onClick={() => navigate('/')}
            className="text-neutral-500 hover:text-neutral-300 text-sm font-mono transition-colors"
          >
            ← Boards
          </button>

          <div className="w-px h-4 bg-dark-border" />

          <span className="font-semibold text-sm text-neutral-100 truncate max-w-[280px]">
            {isLoadingBoard ? 'Loading workspace…' : (board?.name ?? 'Workspace not found')}
          </span>

          <div className="flex items-center gap-1.5 font-mono text-[10px] px-2.5 py-1 rounded-lg bg-neutral-900 border border-dark-border">
            <span className={`w-1.5 h-1.5 rounded-full ${
              saveStatus === 'saved' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'
            }`} />
            <span className={saveStatus === 'saved' ? 'text-neutral-400' : 'text-amber-500'}>
              {saveStatus === 'saved' ? 'Saved' : 'Unsaved'}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-5">
            <span className="text-xs text-neutral-500 font-mono hidden md:inline">
              ⌘S save · ⌘Z undo · ⌘K commands · ⇧drag select
            </span>
            <div className="border border-dark-border rounded-full p-0.5">
              <UserButton afterSignOutUrl="/sign-in" />
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden relative w-full">
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onOpenPalette={() => setPaletteOpen(true)}
          />

          <div className="flex-1 h-full relative overflow-hidden">
            <CanvasEditor
              onSave={handleSave}
              isSaving={isSaving}
              onOpenPalette={() => setPaletteOpen(true)}
              onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
              isSidebarOpen={sidebarOpen}
            />
          </div>

          <AnimatePresence>
            {hasSelectedNode && <ContextPanel />}
          </AnimatePresence>
        </div>

        <CommandPalette
          isOpen={paletteOpen}
          onClose={() => setPaletteOpen(false)}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onSave={handleSave}
        />
      </div>
    </ReactFlowProvider>
  );
}

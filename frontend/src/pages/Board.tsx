import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import { UserButton } from '@clerk/clerk-react';
import { boardsApi } from '../lib/api';
import { useCanvasStore } from '../stores/canvas.store';
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

  const [board, setBoard] = useState<any>(null);
  const [isLoadingBoard, setIsLoadingBoard] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved'>('saved');
  const isInitialLoad = useRef(true);

  // Layout UI states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Load board on mount
  useEffect(() => {
    if (!boardId) return;
    setIsLoadingBoard(true);
    isInitialLoad.current = true;
    
    boardsApi.get(boardId)
      .then((b) => {
        setBoard(b);
        const { nodes: n, edges: e } = b.canvas_data ?? { nodes: [], edges: [] };
        loadCanvas(n, e);
        
        // Wait briefly for react flow layout before marking initial load as finished
        setTimeout(() => {
          isInitialLoad.current = false;
        }, 100);
      })
      .catch(() => {
        setBoard(null);
      })
      .finally(() => setIsLoadingBoard(false));
  }, [boardId]);

  // Handle auto-generation from presets on mount
  useEffect(() => {
    if (!isLoadingBoard && board && location.state?.autoGeneratePrompt && !isInitialLoad.current) {
      const prompt = location.state.autoGeneratePrompt;
      // Clear navigation state
      navigate(location.pathname, { replace: true, state: {} });
      // Generate preset workflow
      generate(prompt);
    }
  }, [isLoadingBoard, board, location.state]);

  // Mark unsaved on canvas changes (skip initial load)
  useEffect(() => {
    if (isInitialLoad.current) return;
    setSaveStatus('unsaved');
  }, [nodes, edges]);

  const handleSave = useCallback(async () => {
    if (!boardId) return;
    setIsSaving(true);
    try {
      await boardsApi.saveCanvas(boardId, nodes, edges);
      setSaveStatus('saved');
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  }, [boardId, nodes, edges]);

  // Ctrl/Cmd + S to save, and Ctrl/Cmd + K to toggle command palette
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
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave]);

  const hasSelectedNode = nodes.some((n) => n.selected);

  return (
    <ReactFlowProvider>
      <div className="w-screen h-screen flex flex-col text-neutral-200 overflow-hidden font-sans select-none">
        
        {/* Premium Compact Dark Header Bar */}
        <header className="h-10 bg-dark-bg border-b border-dark-border flex items-center px-4 gap-3 shrink-0 z-10">
          <button
            onClick={() => navigate('/')}
            className="text-neutral-500 hover:text-neutral-300 text-xs font-mono transition-colors"
          >
            ← Boards
          </button>
          
          <div className="w-px h-3 bg-dark-border" />

          <span className="font-medium text-xs text-neutral-200 truncate max-w-[200px]">
            {isLoadingBoard ? 'Loading workspace...' : (board?.name ?? 'Workspace not found')}
          </span>

          <div className="flex items-center gap-1.5 font-mono text-[9px] px-2 py-0.5 rounded bg-neutral-900 border border-dark-border">
            <span className={`w-1.5 h-1.5 rounded-full ${
              saveStatus === 'saved' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'
            }`} />
            <span className={saveStatus === 'saved' ? 'text-neutral-400' : 'text-amber-500'}>
              {saveStatus === 'saved' ? 'Saved' : 'Unsaved changes'}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <span className="text-[10px] text-neutral-500 font-mono hidden md:inline">
              ⌘S to save · ⌘K command menu
            </span>
            <div className="border border-dark-border rounded-full p-0.5 scale-90">
              <UserButton afterSignOutUrl="/sign-in" />
            </div>
          </div>
        </header>

        {/* Canvas container & Side panels */}
        <div className="flex-1 flex overflow-hidden relative w-full">
          
          {/* Floating Left Sidebar */}
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onOpenPalette={() => setPaletteOpen(true)}
          />

          {/* Main Canvas Editor */}
          <div className="flex-1 h-full relative overflow-hidden">
            <CanvasEditor
              onSave={handleSave}
              isSaving={isSaving}
              onOpenPalette={() => setPaletteOpen(true)}
              onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
              isSidebarOpen={sidebarOpen}
            />
          </div>

          {/* Right Context Panel (slide in on selection) */}
          <AnimatePresence>
            {hasSelectedNode && <ContextPanel />}
          </AnimatePresence>
        </div>

        {/* Global Command Palette dialog modal */}
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
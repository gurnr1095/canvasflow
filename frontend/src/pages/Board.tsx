import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import { UserButton } from '@clerk/clerk-react';
import { boardsApi } from '../lib/api';
import { useCanvasStore } from '../stores/canvas.store';
import CanvasEditor from '../components/canvas/CanvasEditor';

export default function Board() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const { loadCanvas, nodes, edges } = useCanvasStore();
  const [board, setBoard] = useState<any>(null);
  const [isLoadingBoard, setIsLoadingBoard] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved'>('saved');
  const isInitialLoad = useRef(true);

  // Load board on mount
  useEffect(() => {
    if (!boardId) return;
    setIsLoadingBoard(true);
    boardsApi.get(boardId)
      .then((b) => {
        setBoard(b);
        const { nodes: n, edges: e } = b.canvas_data ?? { nodes: [], edges: [] };
        loadCanvas(n, e);
        isInitialLoad.current = false;
      })
      .catch(() => {
        setBoard(null);
      })
      .finally(() => setIsLoadingBoard(false));
  }, [boardId]);

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
    } finally {
      setIsSaving(false);
    }
  }, [boardId, nodes, edges]);

  // Ctrl/Cmd + S to save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave]);

  return (
    <div className="w-screen h-screen flex flex-col">
      {/* Thin header bar */}
      <header className="h-12 bg-white border-b border-gray-200 flex items-center px-4 gap-3 shrink-0">
        <button
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
        >
          ← Boards
        </button>
          <span className="font-medium text-gray-700">
            {isLoadingBoard ? 'Loading...' : (board?.name ?? 'Not found')}
          </span>
        <span
          className={`text-xs ml-1 ${
            saveStatus === 'saved' ? 'text-green-400' : 'text-amber-400'
          }`}
        >
          {saveStatus === 'saved' ? '✓ Saved' : '● Unsaved'}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-400">Ctrl+S to save</span>
          <UserButton />
        </div>
      </header>

      {/* Canvas fills remaining height */}
      <div className="flex-1 overflow-hidden">
        <ReactFlowProvider>
          <CanvasEditor onSave={handleSave} isSaving={isSaving} />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
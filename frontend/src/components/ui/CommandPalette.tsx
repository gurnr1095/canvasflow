import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReactFlow } from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCanvasStore } from '../../stores/canvas.store';
import type { NodeDataLoose } from '../../types/canvas.types';

interface PaletteItem {
  id: string;
  label: string;
  type: 'action' | 'mode' | 'node';
  targetMode?: 'ai' | 'search-nodes';
  action?: () => void;
  nodeId?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onToggleSidebar: () => void;
  onSave: () => void;
}

export default function CommandPalette({ isOpen, onClose, onToggleSidebar, onSave }: Props) {
  const navigate = useNavigate();
  const { fitView, getNode } = useReactFlow();
  const { nodes, addNoteNode, addWorkflowNode, clearCanvas, isGenerating, setGenerating, appendNodes } = useCanvasStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mode, setMode] = useState<'default' | 'ai' | 'search-nodes'>('default');
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state on open/close
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setMode('default');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global listener for Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Keyboard navigation
  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      if (mode !== 'default') {
        setMode('default');
        setQuery('');
      } else {
        onClose();
      }
      return;
    }

    const items = getFilteredItems();

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items.length > 0) {
        await handleSelect(items[selectedIndex]);
      }
    }
  };

  const triggerAIGenerate = async (promptText: string) => {
    if (!promptText.trim()) return;
    setGenerating(true);
    onClose();
    try {
      const { aiApi } = await import('../../lib/api');
      const { nanoid } = await import('nanoid');
      
      const { nodes: newNodes, edges: newEdges } = await aiApi.generate(promptText);

      // Map IDs
      const idMap: Record<string, string> = {};
      const updatedNodes = newNodes.map((n) => {
        const newId = nanoid();
        idMap[n.id] = newId;
        return { ...n, id: newId };
      });
      const updatedEdges = newEdges.map((e) => ({
        ...e,
        id: nanoid(),
        source: idMap[e.source],
        target: idMap[e.target],
      }));

      appendNodes(updatedNodes, updatedEdges);
    } catch (err) {
      console.error('AI generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  const getFilteredItems = (): PaletteItem[] => {
    if (mode === 'ai') {
      return [{ id: 'ai-run', label: `Generate workflow for "${query}"`, type: 'action' }];
    }

    if (mode === 'search-nodes') {
      return nodes
        .filter((n) => {
          const data = n.data as NodeDataLoose;
          const name = String(data.name || data.label || data.title || '');
          return name.toLowerCase().includes(query.toLowerCase());
        })
        .map((n) => {
          const data = n.data as NodeDataLoose;
          return {
            id: `focus-node-${n.id}`,
            label: `Focus on: ${data.name || data.label || data.title || 'Node'}`,
            type: 'node' as const,
            nodeId: n.id,
          };
        });
    }

    const defaultCommands: PaletteItem[] = [
      { id: 'ai-prompt', label: '✨ Generate Workflow using AI...', type: 'mode', targetMode: 'ai' },
      { id: 'add-note', label: '📝 Create Note Node', type: 'action', action: () => addNoteNode(Math.random() * 200 + 100, Math.random() * 200 + 100) },
      { id: 'add-workflow', label: '⚙️ Create Workflow Node', type: 'action', action: () => addWorkflowNode(Math.random() * 200 + 100, Math.random() * 200 + 100) },
      { id: 'search-nodes', label: '🔍 Search Canvas Nodes...', type: 'mode', targetMode: 'search-nodes' },
      { id: 'save', label: '💾 Save Canvas', type: 'action', action: onSave },
      { id: 'fit-view', label: '🧭 Fit View to Nodes', type: 'action', action: () => fitView({ duration: 800 }) },
      { id: 'sidebar', label: '📁 Toggle Left Sidebar', type: 'action', action: onToggleSidebar },
      { id: 'clear', label: '🗑 Clear Canvas', type: 'action', action: () => { if (confirm('Clear entire canvas?')) clearCanvas(); } },
      { id: 'dashboard', label: '🚪 Exit to Dashboard', type: 'action', action: () => navigate('/') },
    ];

    return defaultCommands.filter((cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase())
    );
  };

  const handleSelect = async (item: PaletteItem) => {
    if (item.type === 'mode' && item.targetMode) {
      setMode(item.targetMode);
      setQuery('');
      setSelectedIndex(0);
      return;
    }

    if (item.type === 'node' && item.nodeId) {
      const node = getNode(item.nodeId);
      if (node) {
        fitView({ nodes: [node], duration: 800, maxZoom: 1.2 });
      }
      onClose();
      return;
    }

    if (item.id === 'ai-run') {
      await triggerAIGenerate(query);
      return;
    }

    if (item.action) {
      item.action();
      onClose();
    }
  };

  const filteredItems = getFilteredItems();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            onKeyDown={handleKeyDown}
            className="w-full max-w-xl bg-[#121212] border border-dark-border rounded-xl shadow-[0_24px_48px_rgba(0,0,0,0.8)] overflow-hidden z-10 flex flex-col font-sans"
          >
            {/* Search Input Box */}
            <div className="flex items-center gap-3.5 px-5 py-4 border-b border-dark-border bg-neutral-900/40">
              <span className="text-base text-neutral-500 font-mono select-none">
                {mode === 'ai' ? '✨' : mode === 'search-nodes' ? '🔍' : '>'}
              </span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder={
                  mode === 'ai'
                    ? 'Describe what you want to build...'
                    : mode === 'search-nodes'
                    ? 'Search nodes by title or name...'
                    : 'Type a command or search...'
                }
                className="bg-transparent w-full text-base text-neutral-200 placeholder-neutral-500 outline-none border-none focus:ring-0 focus:outline-none"
              />
              <span className="text-xs font-mono text-neutral-500 bg-neutral-900 border border-dark-border px-2 py-0.5 rounded select-none">
                ESC
              </span>
            </div>

            {/* Content Results */}
            <div className="max-h-[340px] overflow-y-auto p-3 flex flex-col gap-1 bg-dark-bg/25">
              {filteredItems.length === 0 ? (
                <div className="py-10 text-center text-sm font-mono text-neutral-500 select-none">
                  No matching items found
                </div>
              ) : (
                filteredItems.map((item, idx) => {
                  const isActive = idx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full text-left px-4 py-2.5 text-sm rounded-lg flex items-center justify-between font-sans transition-all select-none ${
                        isActive
                          ? 'bg-neutral-900 text-white border-l-2 border-accent-cyan pl-3.5'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      {isActive && (
                        <span className="text-xs font-mono text-neutral-500 flex items-center gap-1.5 select-none">
                          <span>Select</span>
                          <span className="bg-neutral-950 border border-dark-border px-1.5 rounded text-[10px]">⏎</span>
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Command Palette Footer Info */}
            <div className="px-5 py-3 border-t border-dark-border bg-neutral-900/20 text-xs text-neutral-500 font-mono flex items-center justify-between select-none">
              <div className="flex gap-4">
                <span>↑↓ Navigate</span>
                <span>⏎ Select</span>
              </div>
              <div>
                {mode !== 'default' && (
                  <button
                    onClick={() => {
                      setMode('default');
                      setQuery('');
                    }}
                    className="hover:text-neutral-300 transition-colors"
                  >
                    ← Back to main commands
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

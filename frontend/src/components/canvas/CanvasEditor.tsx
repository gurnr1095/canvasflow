import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useCanvasStore } from '../../stores/canvas.store';
import { useAIGenerate } from '../../hooks/useAIGenerate';
import WorkflowNode from './nodes/WorkflowNode';
import NoteNode from './nodes/NoteNode';
import AINode from './nodes/AINode';
import CanvasToolbar from './CanvasToolbar';
import AIChatBar from './AIChatBar';
import ContextMenu, { type ContextMenuItem } from '../ui/ContextMenu';
import { nanoid } from 'nanoid';
import { toast } from 'sonner';

const NODE_TYPES = {
  workflow: WorkflowNode,
  topic: AINode,
  ai: AINode,
  note: NoteNode,
};

interface CanvasEditorProps {
  onSave: () => void;
  isSaving: boolean;
  onOpenPalette: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

interface CtxMenu {
  x: number;
  y: number;
  type: 'canvas' | 'node';
  nodeId?: string;
  canvasPos?: { x: number; y: number };
}

interface SelBox { x1: number; y1: number; x2: number; y2: number }

export default function CanvasEditor({
  onSave,
  isSaving,
  onOpenPalette,
  onToggleSidebar,
  isSidebarOpen,
}: CanvasEditorProps) {
  const {
    nodes, edges,
    onNodesChange, onEdgesChange, onConnect,
    addNoteNode, addWorkflowNode, clearCanvas,
  } = useCanvasStore();

  const { generate, isGenerating } = useAIGenerate();
  const { fitView, screenToFlowPosition, getNodes } = useReactFlow();
  const [emptyPrompt, setEmptyPrompt] = useState('');
  const [ctxMenu, setCtxMenu] = useState<CtxMenu | null>(null);

  // ── Right-drag box selection ──────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const [selBox, setSelBox] = useState<SelBox | null>(null);
  // Stable refs so useEffect closure never goes stale
  const rightDragRef = useRef<{ startX: number; startY: number; moved: boolean } | null>(null);
  const screenToFlowRef = useRef(screenToFlowPosition);
  const getNodesRef = useRef(getNodes);
  useEffect(() => { screenToFlowRef.current = screenToFlowPosition; }, [screenToFlowPosition]);
  useEffect(() => { getNodesRef.current = getNodes; }, [getNodes]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 2) return;
      const target = e.target as HTMLElement;
      if (
        target.closest('.react-flow__node') ||
        target.closest('.react-flow__controls') ||
        target.closest('.react-flow__minimap') ||
        target.closest('[data-toolbar]')
      ) return;

      rightDragRef.current = { startX: e.clientX, startY: e.clientY, moved: false };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!rightDragRef.current) return;
      const dx = e.clientX - rightDragRef.current.startX;
      const dy = e.clientY - rightDragRef.current.startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        rightDragRef.current.moved = true;
        setSelBox({
          x1: rightDragRef.current.startX,
          y1: rightDragRef.current.startY,
          x2: e.clientX,
          y2: e.clientY,
        });
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (e.button !== 2 || !rightDragRef.current) return;
      if (rightDragRef.current.moved) {
        // Convert screen rectangle → flow coordinates
        const { startX, startY } = rightDragRef.current;
        const p1 = screenToFlowRef.current({ x: Math.min(startX, e.clientX), y: Math.min(startY, e.clientY) });
        const p2 = screenToFlowRef.current({ x: Math.max(startX, e.clientX), y: Math.max(startY, e.clientY) });

        const allNodes = getNodesRef.current();
        const selectedIds = new Set(
          allNodes.filter(node => {
            const w = (node.measured as any)?.width  ?? 160;
            const h = (node.measured as any)?.height ?? 80;
            // Partial intersection: node rect overlaps selection rect
            return (
              node.position.x     < p2.x &&
              node.position.x + w > p1.x &&
              node.position.y     < p2.y &&
              node.position.y + h > p1.y
            );
          }).map(n => n.id)
        );

        useCanvasStore.setState(s => ({
          nodes: s.nodes.map(n => ({ ...n, selected: selectedIds.has(n.id) })),
        }));
      }
      rightDragRef.current = null;
      setSelBox(null);
    };

    // Suppress the browser's native context menu only when a drag happened
    const onContextMenu = (e: MouseEvent) => {
      if (rightDragRef.current?.moved) e.preventDefault();
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('contextmenu', onContextMenu, true);

    return () => {
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('contextmenu', onContextMenu, true);
    };
  }, []);
  // ─────────────────────────────────────────────────────────────────────────

  const handlePaneClick = useCallback(
    (event: React.MouseEvent) => {
      const toolbarEl = (event.target as HTMLElement).closest('[data-toolbar]');
      if (toolbarEl) return;
      setCtxMenu(null);
    },
    []
  );

  const handlePaneContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      // Suppress context menu popup when the right button was used for dragging
      if (rightDragRef.current?.moved) return;
      const canvasPos = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      setCtxMenu({ x: event.clientX, y: event.clientY, type: 'canvas', canvasPos });
    },
    [screenToFlowPosition]
  );

  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: any) => {
      event.preventDefault();
      setCtxMenu({ x: event.clientX, y: event.clientY, type: 'node', nodeId: node.id });
    },
    []
  );

  const handleEmptyGenerate = async () => {
    if (!emptyPrompt.trim() || isGenerating) return;
    await generate(emptyPrompt);
    setEmptyPrompt('');
  };

  const handleLoadPreset = async (prompt: string) => {
    if (isGenerating) return;
    await generate(prompt);
  };

  // Build context menu items
  const ctxItems: ContextMenuItem[] = ctxMenu?.type === 'canvas'
    ? [
        {
          label: 'Add Note',
          icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>,
          onClick: () => addNoteNode(ctxMenu.canvasPos!.x, ctxMenu.canvasPos!.y),
        },
        {
          label: 'Add Node',
          icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>,
          onClick: () => addWorkflowNode(ctxMenu.canvasPos!.x, ctxMenu.canvasPos!.y),
        },
        { label: '', divider: true, onClick: () => {} },
        {
          label: 'Fit View',
          icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0-5 5M4 16v4m0 0h4m-4 0 5-5m11 5-5-5m5 5v-4m0 4h-4"/></svg>,
          onClick: () => fitView({ duration: 300, padding: 0.18 }),
        },
        { label: '', divider: true, onClick: () => {} },
        {
          label: 'Clear Canvas',
          danger: true,
          disabled: nodes.length === 0,
          icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/></svg>,
          onClick: () => { if (confirm('Clear entire canvas?')) { clearCanvas(); toast.success('Canvas cleared'); } },
        },
      ]
    : ctxMenu?.type === 'node'
    ? [
        {
          label: 'Duplicate Node',
          icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
          onClick: () => {
            const src = nodes.find(n => n.id === ctxMenu.nodeId);
            if (!src) return;
            useCanvasStore.setState(s => ({
              nodes: [...s.nodes, { ...src, id: nanoid(), selected: false, position: { x: src.position.x + 30, y: src.position.y + 30 } }],
            }));
          },
        },
        { label: '', divider: true, onClick: () => {} },
        {
          label: 'Delete Node',
          danger: true,
          icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/></svg>,
          onClick: () => {
            useCanvasStore.setState(s => ({
              nodes: s.nodes.filter(n => n.id !== ctxMenu.nodeId),
              edges: s.edges.filter(e => e.source !== ctxMenu.nodeId && e.target !== ctxMenu.nodeId),
            }));
            toast.success('Node deleted');
          },
        },
      ]
    : [];

  return (
    <div ref={containerRef} className="w-full h-full relative bg-transparent">
      {/* Canvas ambient gradient */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 42%, rgba(6,182,212,0.045) 0%, transparent 68%)' }}
      />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={handlePaneClick}
        onPaneContextMenu={handlePaneContextMenu}
        onNodeContextMenu={handleNodeContextMenu}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        deleteKeyCode="Delete"
        selectionOnDrag={false}
        panOnDrag={true}
        selectionKeyCode="Shift"
        multiSelectionKeyCode="Shift"
        className="bg-transparent"
        style={{ width: '100%', height: '100%' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="#21262D" />
        <Controls position="bottom-right" showInteractive={false} />
        <MiniMap position="bottom-left" nodeStrokeWidth={3} zoomable pannable />
      </ReactFlow>

      {/* Right-drag selection rectangle */}
      {selBox && (
        <div
          className="sel-march pointer-events-none fixed z-50"
          style={{
            left:   Math.min(selBox.x1, selBox.x2),
            top:    Math.min(selBox.y1, selBox.y2),
            width:  Math.abs(selBox.x2 - selBox.x1),
            height: Math.abs(selBox.y2 - selBox.y1),
          }}
        />
      )}

      <CanvasToolbar
        onSave={onSave}
        isSaving={isSaving}
        onOpenPalette={onOpenPalette}
        onToggleSidebar={onToggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />

      <AIChatBar />

      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          items={ctxItems}
          onClose={() => setCtxMenu(null)}
        />
      )}

      {/* Empty canvas overlay */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-dark-bg/65 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-dark-border bg-dark-panel/90 p-8 shadow-[0_24px_64px_rgba(0,0,0,0.88)] flex flex-col gap-6">

            <div className="flex flex-col gap-2">
              <div className="inline-flex w-fit items-center rounded-full border border-accent-cyan/20 bg-accent-cyan/5 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.32em] text-accent-cyan">
                Start here
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-neutral-100">
                Describe what you want to build.
              </h3>
              <p className="text-xs leading-relaxed text-neutral-500">
                Generate a connected workflow from a prompt, or add nodes manually.
              </p>
            </div>

            <div className="relative">
              <input
                value={emptyPrompt}
                onChange={(e) => setEmptyPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEmptyGenerate()}
                placeholder="e.g. Next.js authentication flow with Auth0..."
                disabled={isGenerating}
                className="w-full rounded-xl border border-dark-border bg-neutral-950/80 px-4 py-3 pr-28 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-accent-cyan/50 transition-colors"
              />
              <button
                onClick={handleEmptyGenerate}
                disabled={isGenerating || !emptyPrompt.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-gradient-to-r from-white to-neutral-200 px-3.5 py-1.5 text-[11px] font-semibold text-dark-bg transition-all hover:from-accent-cyan hover:to-white disabled:opacity-50"
              >
                {isGenerating ? 'Running…' : 'Generate ⚡'}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-dark-border/60" />
              <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-dark-border/60" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-neutral-600">Add manually</span>
                <button
                  onClick={() => addNoteNode(350, 150)}
                  className="flex items-center gap-2 rounded-xl border border-dark-border bg-neutral-900/40 px-3 py-2.5 text-xs font-medium text-neutral-300 transition-all hover:border-neutral-700 hover:text-white text-left"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-60"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  Create Note
                </button>
                <button
                  onClick={() => addWorkflowNode(350, 150)}
                  className="flex items-center gap-2 rounded-xl border border-dark-border bg-neutral-900/40 px-3 py-2.5 text-xs font-medium text-neutral-300 transition-all hover:border-neutral-700 hover:text-white text-left"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-60"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>
                  Create Node
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-neutral-600">Load a preset</span>
                <button
                  onClick={() => handleLoadPreset('Design a Kubernetes service discovery flow with ingress router and microservices')}
                  className="flex items-center gap-2 rounded-xl border border-dark-border bg-neutral-900/20 px-3 py-2.5 text-left text-xs text-neutral-400 transition-all hover:border-accent-cyan/30 hover:bg-neutral-900/50 hover:text-neutral-200"
                >
                  <span className="text-accent-cyan/50 text-[10px]">⚡</span>
                  Kubernetes Discovery
                </button>
                <button
                  onClick={() => handleLoadPreset('Create an OAuth2 authentication flow outlining authorization code grant with PKCE')}
                  className="flex items-center gap-2 rounded-xl border border-dark-border bg-neutral-900/20 px-3 py-2.5 text-left text-xs text-neutral-400 transition-all hover:border-accent-cyan/30 hover:bg-neutral-900/50 hover:text-neutral-200"
                >
                  <span className="text-accent-cyan/50 text-[10px]">⚡</span>
                  OAuth2 PKCE Flow
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

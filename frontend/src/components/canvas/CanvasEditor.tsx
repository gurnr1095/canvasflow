import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useCanvasStore } from '../../stores/canvas.store';
import { useAIGenerate } from '../../hooks/useAIGenerate';
import WorkflowNode from './nodes/WorkflowNode';
import NoteNode from './nodes/NoteNode';
import AINode from './nodes/AINode';
import CanvasToolbar from './CanvasToolbar';

// Map node types
const NODE_TYPES = {
  workflow: WorkflowNode,
  topic: AINode, // Map AI topic nodes to AINode
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
    addNoteNode, addWorkflowNode,
  } = useCanvasStore();

  const { generate, isGenerating } = useAIGenerate();
  const [emptyPrompt, setEmptyPrompt] = useState('');

  const handlePaneClick = useCallback(
    (event: React.MouseEvent) => {
      const toolbarEl = (event.target as HTMLElement).closest('[data-toolbar]');
      if (toolbarEl) return;
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

  return (
    <div className="w-full h-full relative bg-transparent">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={handlePaneClick}
        nodeTypes={NODE_TYPES}
        fitView
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Shift"
        className="bg-transparent"
        style={{ width: '100%', height: '100%' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="#1F1F1F" />
        <Controls position="bottom-right" showInteractive={false} />
        <MiniMap position="bottom-left" nodeStrokeWidth={3} zoomable pannable />
      </ReactFlow>

      {/* Persistent floating Toolbar */}
      <CanvasToolbar
        onSave={onSave}
        isSaving={isSaving}
        onOpenPalette={onOpenPalette}
        onToggleSidebar={onToggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Premium Centered Empty State (ChatGPT + Raycast Vibe) */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-dark-bg/65 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-dark-border bg-dark-panel/90 p-7 shadow-[0_24px_64px_rgba(0,0,0,0.88)]">
            {/* Title / Description */}
            <div className="flex flex-col gap-2">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-accent-cyan/15 bg-accent-cyan/5 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.32em] text-accent-cyan">
                Start here
              </div>
              <h3 className="text-2xl font-semibold tracking-tight text-neutral-100">
                Describe what you want to build.
              </h3>
              <p className="text-sm leading-relaxed text-neutral-400">
                Type an idea below to generate a connected workflow, or get started manually by creating notes and code nodes.
              </p>
            </div>

            {/* AI Prompter */}
            <div className="relative flex items-center">
              <input
                value={emptyPrompt}
                onChange={(e) => setEmptyPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEmptyGenerate()}
                placeholder="e.g. Next.js authentication flow with Auth0..."
                disabled={isGenerating}
                className="w-full rounded-2xl border border-dark-border bg-neutral-950 px-4 py-3.5 pr-28 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-accent-cyan/60"
              />
              <button
                onClick={handleEmptyGenerate}
                disabled={isGenerating || !emptyPrompt.trim()}
                className="absolute right-2 rounded-xl bg-gradient-to-r from-white to-neutral-200 px-3.5 py-1.75 text-[11px] font-semibold text-dark-bg transition-all hover:from-accent-cyan hover:to-white disabled:opacity-50"
              >
                {isGenerating ? 'Running...' : 'Generate ⚡'}
              </button>
            </div>

            {/* Manual Node Quick Actions */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-neutral-500">
                Manual Tools
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => addNoteNode(350, 150)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-dark-border bg-neutral-900/40 px-3 py-2.5 text-xs font-medium text-neutral-300 transition-all hover:border-neutral-700 hover:text-white"
                >
                  <span>📝</span>
                  <span>Create Note</span>
                </button>
                <button
                  onClick={() => addWorkflowNode(350, 150)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-dark-border bg-neutral-900/40 px-3 py-2.5 text-xs font-medium text-neutral-300 transition-all hover:border-neutral-700 hover:text-white"
                >
                  <span>⚙️</span>
                  <span>Create Node</span>
                </button>
              </div>
            </div>

            {/* Presets */}
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-neutral-500">
                Or load a template preset
              </span>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => handleLoadPreset('Design a Kubernetes service discovery flow with ingress router and microservices')}
                  className="rounded-xl border border-dark-border bg-neutral-900/20 px-3 py-2.5 text-left text-xs text-neutral-400 transition-all hover:border-accent-cyan/30 hover:bg-neutral-900/50 hover:text-neutral-200"
                >
                  🚀 Kubernetes Service Discovery
                </button>
                <button
                  onClick={() => handleLoadPreset('Create an OAuth2 authentication flow outlining authorization code grant with PKCE')}
                  className="rounded-xl border border-dark-border bg-neutral-900/20 px-3 py-2.5 text-left text-xs text-neutral-400 transition-all hover:border-accent-cyan/30 hover:bg-neutral-900/50 hover:text-neutral-200"
                >
                  🔐 OAuth2 PKCE Auth Flow
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
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
        <div className="absolute inset-0 flex items-center justify-center bg-dark-bg/60 backdrop-blur-sm z-10 p-4">
          <div className="max-w-md w-full bg-dark-panel border border-dark-border rounded-xl shadow-[0_24px_64px_rgba(0,0,0,0.85)] p-6 flex flex-col gap-6 animate-scale-in">
            {/* Title / Description */}
            <div className="flex flex-col gap-1.5">
              <h3 className="text-base font-semibold text-neutral-100 tracking-tight">
                Describe what you want to build.
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-sans">
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
                className="bg-neutral-950 border border-dark-border focus:border-accent-cyan/60 rounded-xl px-4 py-3 text-xs w-full outline-none pr-24 text-white placeholder-neutral-600 transition-all font-sans"
              />
              <button
                onClick={handleEmptyGenerate}
                disabled={isGenerating || !emptyPrompt.trim()}
                className="absolute right-2 px-3 py-1.5 bg-neutral-100 hover:bg-white text-dark-bg rounded-lg text-[10px] font-bold transition-all disabled:opacity-50 font-sans"
              >
                {isGenerating ? 'Running...' : 'Generate ⚡'}
              </button>
            </div>

            {/* Manual Node Quick Actions */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[9px] font-mono text-neutral-500 tracking-widest uppercase">
                Manual Tools
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => addNoteNode(350, 150)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-neutral-900/40 border border-dark-border hover:border-neutral-700 text-neutral-300 hover:text-white px-3 py-2 rounded-lg text-xs transition-all font-medium font-sans"
                >
                  <span>📝</span>
                  <span>Create Note</span>
                </button>
                <button
                  onClick={() => addWorkflowNode(350, 150)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-neutral-900/40 border border-dark-border hover:border-neutral-700 text-neutral-300 hover:text-white px-3 py-2 rounded-lg text-xs transition-all font-medium font-sans"
                >
                  <span>⚙️</span>
                  <span>Create Node</span>
                </button>
              </div>
            </div>

            {/* Presets */}
            <div className="flex flex-col gap-2">
              <span className="text-[9px] font-mono text-neutral-500 tracking-widest uppercase">
                Or load a template preset
              </span>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => handleLoadPreset('Design a Kubernetes service discovery flow with ingress router and microservices')}
                  className="text-left text-xs bg-neutral-900/20 hover:bg-neutral-900/50 border border-dark-border hover:border-accent-cyan/30 px-3 py-2 rounded-lg text-neutral-400 hover:text-neutral-200 transition-all font-sans"
                >
                  🚀 Kubernetes Service Discovery
                </button>
                <button
                  onClick={() => handleLoadPreset('Create an OAuth2 authentication flow outlining authorization code grant with PKCE')}
                  className="text-left text-xs bg-neutral-900/20 hover:bg-neutral-900/50 border border-dark-border hover:border-accent-cyan/30 px-3 py-2 rounded-lg text-neutral-400 hover:text-neutral-200 transition-all font-sans"
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
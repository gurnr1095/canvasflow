import { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useCanvasStore } from '../../stores/canvas.store';
import TopicNode from './nodes/TopicNode';
import NoteNode from './nodes/NoteNode';
import AINode from './nodes/AINode';
import CanvasToolbar from './CanvasToolbar';

// Defined outside component — prevents node remounting on re-render
const NODE_TYPES = {
  topic: TopicNode,
  note: NoteNode,
  ai: AINode,
};

interface CanvasEditorProps {
  onSave: () => void;
  isSaving: boolean;
}

export default function CanvasEditor({ onSave, isSaving }: CanvasEditorProps) {
  const {
    nodes, edges,
    onNodesChange, onEdgesChange, onConnect,
  } = useCanvasStore();

  const handlePaneClick = useCallback(
    (event: React.MouseEvent) => {
      const toolbarEl = (event.target as HTMLElement).closest('[data-toolbar]');
      if (toolbarEl) return;
      // Pane click does nothing — tool buttons handle adding nodes
    },
    []
  );

  return (
    <div className="w-full h-full relative">
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
        className="bg-gray-50"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#d1d5db" />
        <Controls position="bottom-right" />
        <MiniMap position="bottom-left" nodeStrokeWidth={3} zoomable pannable />
      </ReactFlow>

      <CanvasToolbar onSave={onSave} isSaving={isSaving} />

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-gray-300 text-lg">Use the toolbar to add nodes or generate a roadmap</p>
        </div>
      )}
    </div>
  );
}
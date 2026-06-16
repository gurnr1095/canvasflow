import { memo, useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useCanvasStore } from '../../../stores/canvas.store';

const NOTE_COLORS = [
  { hex: '#FEF08A', name: 'Amber' },
  { hex: '#86EFAC', name: 'Green' },
  { hex: '#6366F1', name: 'Indigo' },
  { hex: '#EC4899', name: 'Pink' },
  { hex: '#1F1F1F', name: 'Dark Gray' }
];

const NoteNode = memo(({ id, data, selected }: NodeProps) => {
  const { title = 'Note', content = 'Double-click to edit...', color = '#FEF08A' } = data as any;
  const [editing, setEditing] = useState(false);
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);

  return (
    <div
      className={`rounded-lg bg-dark-panel border-y border-r transition-all duration-200 min-w-[200px] max-w-[260px] min-h-[90px] flex flex-col ${
        selected ? 'border-accent-cyan shadow-[0_0_12px_rgba(6,182,212,0.25)]' : 'border-dark-border hover:border-neutral-700'
      }`}
      style={{
        borderLeft: `3px solid ${color}`,
      }}
    >
      {/* Note Header */}
      <div className="px-3 py-1.5 bg-neutral-900/40 border-b border-dark-border/60 flex items-center justify-between">
        <span className="font-sans text-[11px] font-semibold text-neutral-300 tracking-wide">
          📝 {title}
        </span>
      </div>

      {/* Note Body */}
      <div 
        className="p-3 flex-1 flex flex-col"
        onDoubleClick={() => setEditing(true)}
      >
        {editing ? (
          <textarea
            autoFocus
            value={content}
            onChange={(e) => updateNodeData(id, { content: e.target.value })}
            onBlur={() => setEditing(false)}
            className="w-full flex-1 min-h-[60px] bg-transparent resize-none outline-none text-xs text-neutral-300 font-sans leading-relaxed"
            placeholder="Type your note content..."
          />
        ) : (
          <p className="text-xs text-neutral-400 whitespace-pre-wrap leading-relaxed font-sans">
            {content || 'Double-click to add content'}
          </p>
        )}
      </div>

      <Handle type="target" position={Position.Top} className="!bg-dark-border-focus" />
      <Handle type="source" position={Position.Bottom} className="!bg-dark-border-focus" />
    </div>
  );
});

NoteNode.displayName = 'NoteNode';
export default NoteNode;
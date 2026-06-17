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
      className={`flex min-h-[120px] min-w-[220px] max-w-[290px] flex-col overflow-hidden rounded-2xl border bg-[#121212] shadow-[0_10px_24px_rgba(0,0,0,0.45)] transition-all duration-200 ${
        selected
          ? 'border-accent-cyan/70 shadow-[0_0_0_1px_rgba(6,182,212,0.25),0_10px_24px_rgba(0,0,0,0.5)]'
          : 'border-dark-border/80 hover:border-neutral-600'
      }`}
      style={{
        borderLeft: `4px solid ${color}`,
      }}
    >
      <div className="flex items-center justify-between border-b border-dark-border/60 bg-gradient-to-r from-neutral-900 to-neutral-950 px-3 py-2">
        <span className="truncate font-sans text-[11px] font-semibold tracking-[0.2em] text-neutral-300 uppercase">
          {title}
        </span>
        <span className="rounded-full bg-neutral-800/80 px-1.5 py-0.5 text-[9px] font-mono text-neutral-500">Note</span>
      </div>

      <div
        className="flex flex-1 flex-col p-3"
        onDoubleClick={() => setEditing(true)}
      >
        {editing ? (
          <textarea
            autoFocus
            value={content}
            onChange={(e) => updateNodeData(id, { content: e.target.value })}
            onBlur={() => setEditing(false)}
            className="min-h-[70px] w-full flex-1 resize-none bg-transparent font-sans text-xs leading-relaxed text-neutral-200 outline-none placeholder:text-neutral-500"
            placeholder="Type your note content..."
          />
        ) : (
          <p className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-neutral-400">
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
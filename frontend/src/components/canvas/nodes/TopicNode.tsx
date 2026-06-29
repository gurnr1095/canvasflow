import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useCanvasStore } from '../../../stores/canvas.store';
import type { TopicData } from '../../../types/canvas.types';

const COLORS = ['#93C5FD', '#86EFAC', '#FCA5A5', '#D8B4FE', '#FDE68A'];

const TopicNode = memo(({ id, data, selected }: NodeProps) => {
  const { label = 'Topic', description = '', color = '#93C5FD' } = data as unknown as TopicData;
  const [editingLabel, setEditingLabel] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`relative min-w-[190px] max-w-[260px] overflow-hidden rounded-2xl border bg-dark-panel shadow-[0_10px_24px_rgba(0,0,0,0.45)] transition-all duration-200 ${
        selected
          ? 'border-accent-cyan/60 shadow-[0_0_0_1px_rgba(6,182,212,0.2),0_10px_24px_rgba(0,0,0,0.52)]'
          : 'border-dark-border/80 hover:border-neutral-600'
      }`}
      style={{ borderLeft: `3px solid ${color}` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-dark-border/50 bg-neutral-900/40 px-3.5 py-2.5">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
          {editingLabel ? (
            <input
              autoFocus
              value={label}
              onChange={(e) => updateNodeData(id, { label: e.target.value })}
              onBlur={() => setEditingLabel(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingLabel(false)}
              className="flex-1 bg-transparent text-xs font-semibold text-neutral-100 outline-none border-b border-accent-cyan/50 font-mono min-w-0"
            />
          ) : (
            <h4
              className="truncate font-mono text-xs font-semibold text-neutral-100 cursor-text"
              onDoubleClick={() => setEditingLabel(true)}
              title={label}
            >
              {label}
            </h4>
          )}
        </div>

        {/* Compact color swatches */}
        <div className="flex gap-1 shrink-0">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => updateNodeData(id, { color: c })}
              className={`w-3 h-3 rounded-full transition-transform hover:scale-125 border ${
                color === c ? 'border-white/50 scale-110' : 'border-transparent'
              }`}
              style={{ background: c }}
              title={c}
            />
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="p-3">
        {editingDesc ? (
          <textarea
            autoFocus
            value={description}
            onChange={(e) => updateNodeData(id, { description: e.target.value })}
            onBlur={() => setEditingDesc(false)}
            className="w-full min-h-[48px] bg-transparent text-[11px] text-neutral-300 outline-none resize-none leading-relaxed placeholder:text-neutral-600"
            placeholder="Add a description..."
          />
        ) : (
          <p
            className="text-[11px] text-neutral-400 leading-relaxed cursor-text"
            onDoubleClick={() => setEditingDesc(true)}
          >
            {description || 'Double-click to add a description'}
          </p>
        )}
      </div>

      <Handle type="target" position={Position.Top}    className="!bg-dark-border-focus" />
      <Handle type="source" position={Position.Bottom} className="!bg-dark-border-focus" />
      <Handle type="source" position={Position.Right}  className="!bg-dark-border-focus" />
      <Handle type="target" position={Position.Left}   className="!bg-dark-border-focus" />
    </motion.div>
  );
});

TopicNode.displayName = 'TopicNode';
export default TopicNode;

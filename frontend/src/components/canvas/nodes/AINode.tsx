import { memo } from 'react';
import { motion } from 'framer-motion';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { AINodeData } from '../../../types/canvas.types';

const AINode = memo(({ data, selected }: NodeProps) => {
  const { label = 'AI Node', description = '' } = data as unknown as AINodeData;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 16px 32px rgba(0,0,0,0.6)' }}
      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`relative flex min-w-[190px] max-w-[260px] flex-col gap-1.5 rounded-2xl border bg-dark-panel p-3.5 shadow-[0_10px_24px_rgba(0,0,0,0.45)] transition-all duration-200 ${
        selected
          ? 'border-accent-cyan/70 shadow-[0_0_0_1px_rgba(6,182,212,0.25),0_10px_24px_rgba(0,0,0,0.52)]'
          : 'border-accent-cyan/20 hover:border-accent-cyan/50'
      }`}
      style={{ borderLeft: selected ? '2px solid rgba(6,182,212,0.8)' : '2px solid rgba(6,182,212,0.4)' }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className="text-sm shrink-0">✨</span>
          <h4 className="truncate font-mono text-xs font-semibold text-neutral-100" title={label}>
            {label}
          </h4>
        </div>
        <span className="shrink-0 rounded-full border border-accent-cyan/25 bg-accent-cyan/10 px-1.5 py-0.5 text-[8px] font-mono font-bold text-accent-cyan">
          AI
        </span>
      </div>

      {description && (
        <p className="mt-0.5 text-[10px] leading-relaxed text-neutral-400">
          {description}
        </p>
      )}

      <Handle type="target" position={Position.Top}    className="!bg-accent-cyan/50" />
      <Handle type="source" position={Position.Bottom} className="!bg-accent-cyan/50" />
      <Handle type="target" position={Position.Left}   className="!bg-accent-cyan/50" />
      <Handle type="source" position={Position.Right}  className="!bg-accent-cyan/50" />
    </motion.div>
  );
});

AINode.displayName = 'AINode';
export default AINode;

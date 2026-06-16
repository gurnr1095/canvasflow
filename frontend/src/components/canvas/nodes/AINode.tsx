import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

const AINode = memo(({ data, selected }: NodeProps) => {
  const { label = 'AI Node', description = '' } = data as any;

  return (
    <div
      className={`rounded-lg bg-dark-panel border transition-all duration-200 min-w-[180px] max-w-[240px] p-3 flex flex-col gap-1.5 relative ${
        selected
          ? 'border-accent-cyan shadow-[0_0_15px_rgba(6,182,212,0.3)]'
          : 'border-accent-cyan/40 shadow-[0_0_10px_rgba(6,182,212,0.1)] hover:border-accent-cyan/70'
      }`}
    >
      {/* AI Badge */}
      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-accent-cyan to-accent-blue text-black text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-full select-none shadow">
        AI
      </div>

      {/* Node Content */}
      <div>
        <h4 className="font-mono text-xs font-semibold text-neutral-100 truncate" title={label}>
          ✨ {label}
        </h4>
        {description && (
          <p className="text-[10px] text-neutral-400 font-sans mt-1 leading-relaxed line-clamp-3">
            {description}
          </p>
        )}
      </div>

      {/* React Flow Handles */}
      <Handle type="target" position={Position.Top} className="!bg-accent-cyan/50" />
      <Handle type="source" position={Position.Bottom} className="!bg-accent-cyan/50" />
      <Handle type="target" position={Position.Left} className="!bg-accent-cyan/50" />
      <Handle type="source" position={Position.Right} className="!bg-accent-cyan/50" />
    </div>
  );
});

AINode.displayName = 'AINode';
export default AINode;
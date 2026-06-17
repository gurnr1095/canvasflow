import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

const AINode = memo(({ data, selected }: NodeProps) => {
  const { label = 'AI Node', description = '' } = data as any;

  return (
    <div
      className={`relative flex min-w-[190px] max-w-[260px] flex-col gap-1.5 rounded-2xl border bg-[#121A20] p-3.5 shadow-[0_10px_24px_rgba(0,0,0,0.45)] transition-all duration-200 ${
        selected
          ? 'border-accent-cyan/70 shadow-[0_0_0_1px_rgba(6,182,212,0.25),0_10px_24px_rgba(0,0,0,0.52)]'
          : 'border-accent-cyan/20 hover:border-accent-cyan/50'
      }`}
    >
      <div className="absolute -right-2 -top-2 select-none rounded-full bg-gradient-to-r from-accent-cyan to-accent-blue px-1.5 py-0.5 text-[8px] font-mono font-bold text-black shadow">
        AI
      </div>

      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm">✨</span>
          <h4 className="truncate font-mono text-xs font-semibold text-neutral-100" title={label}>
            {label}
          </h4>
        </div>
        {description && (
          <p className="mt-1.5 text-[10px] leading-relaxed text-neutral-400">
            {description}
          </p>
        )}
      </div>

      <Handle type="target" position={Position.Top} className="!bg-accent-cyan/50" />
      <Handle type="source" position={Position.Bottom} className="!bg-accent-cyan/50" />
      <Handle type="target" position={Position.Left} className="!bg-accent-cyan/50" />
      <Handle type="source" position={Position.Right} className="!bg-accent-cyan/50" />
    </div>
  );
});

AINode.displayName = 'AINode';
export default AINode;
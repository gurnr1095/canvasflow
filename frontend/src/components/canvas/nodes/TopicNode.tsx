import { memo, useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useCanvasStore } from '../../../stores/canvas.store';

const COLORS = ['#93C5FD', '#86EFAC', '#FCA5A5', '#D8B4FE', '#FDE68A'];

const TopicNode = memo(({ id, data, selected }: NodeProps) => {
  const { label, description, color } = data as any;
  const [editingLabel, setEditingLabel] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);

  return (
    <div
      className="rounded-xl shadow-md px-4 py-3 min-w-[180px] max-w-[240px]"
      style={{
        background: color,
        border: selected ? '2px solid #2563eb' : '2px solid transparent',
      }}
    >
      {/* Color swatches */}
      <div className="flex gap-1 mb-2">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => updateNodeData(id, { color: c })}
            className="w-3 h-3 rounded-full border border-black/10 hover:scale-125 transition-transform"
            style={{ background: c }}
          />
        ))}
      </div>

      {/* Label */}
      {editingLabel ? (
        <input
          autoFocus
          value={label}
          onChange={(e) => updateNodeData(id, { label: e.target.value })}
          onBlur={() => setEditingLabel(false)}
          onKeyDown={(e) => e.key === 'Enter' && setEditingLabel(false)}
          className="w-full font-semibold text-gray-800 bg-transparent border-b border-gray-400 outline-none text-sm mb-1"
        />
      ) : (
        <p
          className="font-semibold text-gray-800 text-sm mb-1 cursor-text"
          onDoubleClick={() => setEditingLabel(true)}
        >
          📘 {label}
        </p>
      )}

      {/* Description */}
      {editingDesc ? (
        <input
          autoFocus
          value={description}
          onChange={(e) => updateNodeData(id, { description: e.target.value })}
          onBlur={() => setEditingDesc(false)}
          onKeyDown={(e) => e.key === 'Enter' && setEditingDesc(false)}
          className="w-full text-xs text-gray-600 bg-transparent border-b border-gray-300 outline-none"
        />
      ) : (
        <p
          className="text-xs text-gray-600 cursor-text"
          onDoubleClick={() => setEditingDesc(true)}
        >
          {description || 'Double-click to add description'}
        </p>
      )}

      <Handle type="target" position={Position.Top}    className="!w-2.5 !h-2.5 !bg-blue-400" />
      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-blue-400" />
      <Handle type="source" position={Position.Right}  className="!w-2.5 !h-2.5 !bg-blue-400" />
      <Handle type="target" position={Position.Left}   className="!w-2.5 !h-2.5 !bg-blue-400" />
    </div>
  );
});

TopicNode.displayName = 'TopicNode';
export default TopicNode;
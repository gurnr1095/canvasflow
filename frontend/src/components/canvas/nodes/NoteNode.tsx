import { memo, useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useCanvasStore } from '../../../stores/canvas.store';

const NOTE_COLORS = ['#FEF08A', '#86EFAC', '#FCA5A5', '#E9D5FF'];

const NoteNode = memo(({ id, data, selected }: NodeProps) => {
  const { content, color } = data as any;
  const [editing, setEditing] = useState(false);
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);

  return (
    <div
      className="rounded-sm shadow px-3 py-2 min-w-[150px] max-w-[220px] min-h-[100px]"
      style={{
        background: color,
        border: selected ? '2px solid #2563eb' : '2px solid transparent',
      }}
      onDoubleClick={() => setEditing(true)}
    >
      <div className="flex gap-1 mb-2">
        {NOTE_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => updateNodeData(id, { color: c })}
            className="w-3 h-3 rounded-full border border-black/10"
            style={{ background: c }}
          />
        ))}
      </div>

      {editing ? (
        <textarea
          autoFocus
          value={content}
          onChange={(e) => updateNodeData(id, { content: e.target.value })}
          onBlur={() => setEditing(false)}
          className="w-full h-20 bg-transparent resize-none outline-none text-sm text-gray-700"
          placeholder="Type your note..."
        />
      ) : (
        <p className="text-sm text-gray-700 whitespace-pre-wrap">
          📝 {content || 'Double-click to edit'}
        </p>
      )}

      <Handle type="target" position={Position.Top}   className="!w-2.5 !h-2.5 !bg-yellow-400" />
      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-yellow-400" />
    </div>
  );
});

NoteNode.displayName = 'NoteNode';
export default NoteNode;
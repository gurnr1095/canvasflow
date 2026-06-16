import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

// AI Node = visual marker for where AI-generated content was injected
// It's a non-editable label node, generated automatically
const AINode = memo(({ data, selected }: NodeProps) => {
  const { label } = data as any;

  return (
    <div
      className="rounded-xl px-4 py-2 text-sm font-medium shadow-md"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: selected ? '2px solid #fff' : '2px solid transparent',
        minWidth: '140px',
        textAlign: 'center',
      }}
    >
      🤖 {label}
      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-white" />
    </div>
  );
});

AINode.displayName = 'AINode';
export default AINode;
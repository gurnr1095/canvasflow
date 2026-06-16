import { memo, useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { useTranslation } from 'react-i18next';

// Labels are intentionally omitted here — they are resolved at render-time
// via i18next so the UI adapts to the active locale automatically.
const STATUS_CONFIG = {
  pending:   { dotColor: 'bg-neutral-500',             textColor: 'text-neutral-400' },
  running:   { dotColor: 'bg-accent-blue animate-pulse', textColor: 'text-blue-400'  },
  completed: { dotColor: 'bg-green-500',               textColor: 'text-green-400'  },
  failed:    { dotColor: 'bg-red-500',                 textColor: 'text-red-400'    },
};

const WorkflowNode = memo(({ id, data, selected }: NodeProps) => {
  const { t } = useTranslation();
  const { name = t('workflowNode.defaultName'), status = 'pending', inputs = [], outputs = [] } = data as any;
  const [expanded, setExpanded] = useState(true);

  // Security: Validate status against an explicit allowlist using hasOwnProperty to
  // prevent prototype pollution attacks via bracket notation with user-controlled input.
  // e.g. status = "__proto__" or "constructor" would bypass a simple `in` check.
  const VALID_STATUSES = ['pending', 'running', 'completed', 'failed'] as const;
  type ValidStatus = typeof VALID_STATUSES[number];
  const safeStatus: ValidStatus = VALID_STATUSES.includes(status as ValidStatus)
    && Object.prototype.hasOwnProperty.call(STATUS_CONFIG, status)
      ? (status as ValidStatus)
      : 'pending';
  const statusInfo = STATUS_CONFIG[safeStatus];

  return (
    <div
      className={`rounded-lg bg-dark-panel border transition-all duration-200 min-w-[230px] max-w-[310px] overflow-hidden ${
        selected ? 'border-accent-cyan shadow-[0_0_12px_rgba(6,182,212,0.25)]' : 'border-dark-border hover:border-neutral-700'
      }`}
    >
      {/* Node Header */}
      <div className="bg-neutral-900/60 px-3.5 py-2.5 flex items-center justify-between border-b border-dark-border">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-neutral-400 text-sm select-none">⚙️</span>
          <span className="font-mono text-sm font-semibold text-neutral-200 truncate" title={name}>
            {name}
          </span>
        </div>
        
        {/* Toggle expansion */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="text-xs text-neutral-500 hover:text-neutral-300 p-0.5"
        >
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Node Body */}
      {expanded && (
        <div className="p-3.5 flex flex-col gap-3.5 bg-dark-panel">
          {/* Status */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500 font-mono">{t('workflowNode.status')}</span>
            <div className="flex items-center gap-2 font-mono">
              <span className={`w-2 h-2 rounded-full ${statusInfo.dotColor}`} />
              <span className={statusInfo.textColor}>
                {t(`workflowNode.statusLabels.${safeStatus}`)}
              </span>
            </div>
          </div>

          {/* Inputs */}
          {inputs.length > 0 && (
            <div className="flex flex-col gap-1.5 border-t border-dark-border/40 pt-2.5">
              <span className="text-[10px] font-mono text-neutral-500 tracking-wider">{t('workflowNode.inputs')}</span>
              <div className="flex flex-wrap gap-1.5">
                {inputs.map((inp: string, index: number) => (
                  <span
                    key={index}
                    className="text-[10px] font-mono bg-neutral-900/80 text-neutral-300 px-2 py-0.5 rounded border border-dark-border"
                  >
                    {inp}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Outputs */}
          {outputs.length > 0 && (
            <div className="flex flex-col gap-1.5 border-t border-dark-border/40 pt-2.5">
              <span className="text-[10px] font-mono text-neutral-500 tracking-wider">{t('workflowNode.outputs')}</span>
              <div className="flex flex-wrap gap-1.5">
                {outputs.map((out: string, index: number) => (
                  <span
                    key={index}
                    className="text-[10px] font-mono bg-neutral-900/80 text-accent-cyan/80 px-2 py-0.5 rounded border border-dark-border"
                  >
                    {out}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Standard Handles */}
      <Handle type="target" position={Position.Top} className="!bg-dark-border-focus" />
      <Handle type="source" position={Position.Bottom} className="!bg-dark-border-focus" />
      <Handle type="target" position={Position.Left} className="!bg-dark-border-focus" />
      <Handle type="source" position={Position.Right} className="!bg-dark-border-focus" />
    </div>
  );
});

WorkflowNode.displayName = 'WorkflowNode';
export default WorkflowNode;

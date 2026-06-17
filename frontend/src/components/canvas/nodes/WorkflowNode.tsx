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
      className={`min-w-[240px] max-w-[320px] overflow-hidden rounded-2xl border bg-[#111111] shadow-[0_10px_28px_rgba(0,0,0,0.45)] transition-all duration-200 ${
        selected
          ? 'border-accent-cyan/70 shadow-[0_0_0_1px_rgba(6,182,212,0.25),0_10px_28px_rgba(0,0,0,0.55)]'
          : 'border-dark-border/80 hover:border-neutral-600'
      }`}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between border-b border-dark-border/70 bg-gradient-to-r from-neutral-900 to-neutral-950 px-3.5 py-2.5">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="select-none rounded-md bg-neutral-800/80 px-1.5 py-0.5 text-sm text-neutral-300">⚙️</span>
          <span className="truncate font-mono text-sm font-semibold text-neutral-100" title={name}>
            {name}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className="rounded-md p-1 text-xs text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-neutral-200"
        >
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Node Body */}
      {expanded && (
        <div className="flex flex-col gap-3 bg-dark-panel p-3.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-neutral-500">{t('workflowNode.status')}</span>
            <div className="flex items-center gap-2 font-mono">
              <span className={`h-2 w-2 rounded-full ${statusInfo.dotColor}`} />
              <span className={statusInfo.textColor}>
                {t(`workflowNode.statusLabels.${safeStatus}`)}
              </span>
            </div>
          </div>

          {inputs.length > 0 && (
            <div className="flex flex-col gap-1.5 border-t border-dark-border/40 pt-2.5">
              <span className="text-[10px] font-mono tracking-[0.3em] text-neutral-500">{t('workflowNode.inputs')}</span>
              <div className="flex flex-wrap gap-1.5">
                {inputs.map((inp: string, index: number) => (
                  <span
                    key={index}
                    className="rounded-full border border-dark-border bg-neutral-900/80 px-2 py-0.5 text-[10px] font-mono text-neutral-300"
                  >
                    {inp}
                  </span>
                ))}
              </div>
            </div>
          )}

          {outputs.length > 0 && (
            <div className="flex flex-col gap-1.5 border-t border-dark-border/40 pt-2.5">
              <span className="text-[10px] font-mono tracking-[0.3em] text-neutral-500">{t('workflowNode.outputs')}</span>
              <div className="flex flex-wrap gap-1.5">
                {outputs.map((out: string, index: number) => (
                  <span
                    key={index}
                    className="rounded-full border border-accent-cyan/15 bg-accent-cyan/5 px-2 py-0.5 text-[10px] font-mono text-accent-cyan"
                  >
                    {out}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Handle type="target" position={Position.Top} className="!bg-dark-border-focus" />
      <Handle type="source" position={Position.Bottom} className="!bg-dark-border-focus" />
      <Handle type="target" position={Position.Left} className="!bg-dark-border-focus" />
      <Handle type="source" position={Position.Right} className="!bg-dark-border-focus" />
    </div>
  );
});

WorkflowNode.displayName = 'WorkflowNode';
export default WorkflowNode;

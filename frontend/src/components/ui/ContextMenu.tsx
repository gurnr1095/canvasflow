import { useEffect, useRef } from 'react';

export interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
}

interface Props {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export default function ContextMenu({ x, y, items, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const down = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', down);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('mousedown', down);
      document.removeEventListener('keydown', key);
    };
  }, [onClose]);

  // Clamp to viewport
  const style: React.CSSProperties = {
    position: 'fixed',
    top: Math.min(y, window.innerHeight - 220),
    left: Math.min(x, window.innerWidth - 180),
    zIndex: 9999,
  };

  return (
    <div
      ref={ref}
      style={style}
      className="min-w-[168px] rounded-xl border border-dark-border bg-dark-panel/95 p-1 shadow-[0_8px_32px_rgba(0,0,0,0.7)] backdrop-blur-xl"
    >
      {items.map((item, i) =>
        item.divider ? (
          <div key={i} className="my-1 h-px bg-dark-border/60" />
        ) : (
          <button
            key={i}
            disabled={item.disabled}
            onClick={() => { item.onClick(); onClose(); }}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              item.danger
                ? 'text-red-400/90 hover:bg-red-950/30 hover:text-red-300'
                : 'text-neutral-300 hover:bg-white/[0.06] hover:text-white'
            }`}
          >
            {item.icon && <span className="shrink-0 opacity-60 w-3.5 h-3.5 flex items-center">{item.icon}</span>}
            {item.label}
          </button>
        )
      )}
    </div>
  );
}

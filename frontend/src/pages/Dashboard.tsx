import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, UserButton } from '@clerk/clerk-react';
import { toast } from 'sonner';
import { boardsApi } from '../lib/api';
import { motion } from 'framer-motion';
import type { Node as FlowNode } from '@xyflow/react';
import type { BoardListItem } from '../types/canvas.types';

const PRESETS = [
  { name: 'React App Architecture', prompt: 'Create a micro-frontend architecture for a React ecommerce app with checkout, catalog, and auth modules' },
  { name: 'API Gateway Flow', prompt: 'Design an API Gateway routing flow with authentication, rate limiting, and caching middleware' },
  { name: 'CI/CD Pipeline', prompt: 'Create a GitHub Actions CI/CD deployment pipeline schema for a Dockerized Node.js service' },
];

const PREVIEW_NODES = [
  { id: 1, label: 'API Gateway',  x: 12,  y: 92,  ai: false, floatDelay: 0   },
  { id: 2, label: 'Auth',         x: 150, y: 42,  ai: true,  floatDelay: 0.5 },
  { id: 3, label: 'Rate Limiter', x: 150, y: 145, ai: true,  floatDelay: 1.1 },
  { id: 4, label: 'Cache',        x: 275, y: 67,  ai: true,  floatDelay: 1.7 },
  { id: 5, label: 'Microservice', x: 275, y: 155, ai: true,  floatDelay: 0.8 },
];

const PREVIEW_EDGES = [
  'M117,107 C135,107 135,57 150,57',
  'M117,107 C135,107 135,160 150,160',
  'M255,57 C266,57 266,82 275,82',
  'M255,160 C266,160 266,170 275,170',
];

function CanvasPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.55, delay: 0.15, ease: 'easeOut' }}
      className="relative w-full max-w-[430px]"
    >
      <div className="rounded-2xl border border-white/[0.07] bg-dark-panel overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.6)]">

        {/* Fake toolbar */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.05]">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
          </div>
          <span className="text-[10px] font-mono text-neutral-600 ml-2 tracking-wide">API Gateway Flow</span>
          <div className="ml-auto flex gap-2">
            <div className="h-4 w-14 rounded-md bg-white/5" />
            <div className="h-4 w-14 rounded-md bg-accent-cyan/[0.15]" />
          </div>
        </div>

        {/* SVG canvas */}
        <div
          className="relative overflow-hidden"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.12) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(6,182,212,0.05) 0%, transparent 65%)' }}
          />
          <svg viewBox="0 0 400 215" className="w-full h-auto relative z-10">
            <defs>
              <filter id="cfNodeGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {PREVIEW_EDGES.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="none"
                stroke="rgba(6,182,212,0.3)"
                strokeWidth="1.5"
                strokeDasharray="5 3"
              />
            ))}

            {PREVIEW_NODES.map((node) => (
              <motion.g
                key={node.id}
                animate={{ y: [-3, 3] }}
                transition={{
                  duration: 2.8 + node.floatDelay * 0.4,
                  repeat: Infinity,
                  repeatType: 'mirror',
                  ease: 'easeInOut',
                  delay: node.floatDelay,
                }}
              >
                <rect
                  x={node.x}
                  y={node.y}
                  width={105}
                  height={30}
                  rx={15}
                  fill="#161B22"
                  stroke={node.ai ? 'rgba(6,182,212,0.28)' : 'rgba(255,255,255,0.1)'}
                  strokeWidth="1"
                  filter={node.ai ? 'url(#cfNodeGlow)' : undefined}
                />
                <text x={node.x + 11} y={node.y + 20} fontSize="9" fill="rgba(6,182,212,0.75)">
                  ✦
                </text>
                <text
                  x={node.x + 24}
                  y={node.y + 20}
                  fontSize="10"
                  fill="rgba(255,255,255,0.82)"
                  fontFamily="system-ui, sans-serif"
                  fontWeight="500"
                >
                  {node.label}
                </text>
                {node.ai && (
                  <g>
                    <circle cx={node.x + 106} cy={node.y} r={8} fill="#0891b2" stroke="#0c1018" strokeWidth="1.5" />
                    <text
                      x={node.x + 106}
                      y={node.y + 4}
                      fontSize="6"
                      fill="white"
                      textAnchor="middle"
                      fontFamily="system-ui"
                      fontWeight="700"
                    >
                      AI
                    </text>
                  </g>
                )}
              </motion.g>
            ))}
          </svg>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.05]">
          <span className="text-[10px] font-mono text-neutral-500">5 nodes · 4 connections</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
            <span className="text-[10px] font-mono text-accent-cyan/60">AI ready</span>
          </div>
        </div>
      </div>

      {/* Glow beneath card */}
      <div
        className="absolute -bottom-5 left-1/2 -translate-x-1/2 h-8 w-3/4 rounded-full pointer-events-none"
        style={{ background: 'rgba(6,182,212,0.08)', filter: 'blur(18px)' }}
      />
    </motion.div>
  );
}

function BoardThumbnail({ nodes }: { nodes: FlowNode[] }) {
  if (!nodes.length) return null;
  const xs = nodes.map((n) => n.position?.x ?? 0);
  const ys = nodes.map((n) => n.position?.y ?? 0);
  const minX = Math.min(...xs) - 20;
  const minY = Math.min(...ys) - 20;
  const maxX = Math.max(...xs) + 170;
  const maxY = Math.max(...ys) + 50;
  return (
    <svg
      viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {nodes.map((n) => (
        <rect
          key={n.id}
          x={n.position?.x ?? 0}
          y={n.position?.y ?? 0}
          width={150}
          height={32}
          rx={6}
          fill="rgba(6,182,212,0.07)"
          stroke="rgba(6,182,212,0.18)"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}

export default function Dashboard() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [boards, setBoards] = useState<BoardListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = () => {
    setLoading(true);
    boardsApi.list()
      .then(setBoards)
      .catch(() => setError('Failed to load boards'))
      .finally(() => setLoading(false));
  };

  const createBoard = async (nameToCreate = newName) => {
    const trimmed = nameToCreate.trim();
    if (!trimmed) {
      setError('Board name cannot be empty');
      return;
    }
    setCreating(true);
    setError('');
    try {
      const board = await boardsApi.create(trimmed);
      navigate(`/board/${board.id}`);
    } catch (error: any) {
      setError(error.response?.data?.detail || 'Failed to create board');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBoard = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this workspace?')) return;
    try {
      await boardsApi.delete(id);
      setBoards((prev) => prev.filter((b) => b.id !== id));
      toast.success('Workspace deleted');
    } catch {
      toast.error('Failed to delete workspace');
    }
  };

  const handleRename = async (id: string) => {
    const trimmed = renameValue.trim();
    if (!trimmed) { setRenamingId(null); return; }
    try {
      const updated = await boardsApi.rename(id, trimmed);
      setBoards((prev) => prev.map((b) => b.id === id ? { ...b, name: updated.name } : b));
      toast.success('Workspace renamed');
    } catch {
      toast.error('Failed to rename workspace');
    } finally {
      setRenamingId(null);
    }
  };

  const handlePresetClick = async (preset: typeof PRESETS[0]) => {
    setCreating(true);
    try {
      const board = await boardsApi.create(preset.name);
      navigate(`/board/${board.id}`, { state: { autoGeneratePrompt: preset.prompt } });
    } catch {
      setError('Failed to create board from preset');
      setCreating(false);
    }
  };

  const filteredBoards = boards.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalNodes = boards.reduce(
    (sum, board) => sum + (board.canvas_data?.nodes?.length || 0),
    0
  );
  const totalEdges = boards.reduce(
    (sum, board) => sum + (board.canvas_data?.edges?.length || 0),
    0
  );

  return (
    <div className="min-h-screen bg-dark-bg text-neutral-200 flex flex-col font-sans">

      {/* Header */}
      <header className="border-b border-dark-border px-8 py-4.5 flex items-center justify-between bg-dark-bg/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3.5">
          <img src="/logo.svg" alt="CanvasFlow" className="w-7 h-7" />
          <span className="font-mono text-base tracking-wider font-semibold text-white">
            CanvasFlow<span className="text-accent-cyan">.</span>dev
          </span>
        </div>
        <div className="flex items-center gap-5">
          <span className="text-xs text-neutral-400 font-mono">
            {user?.primaryEmailAddress?.emailAddress}
          </span>
          <div className="border border-dark-border rounded-full p-0.5">
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8 pb-16 flex-1 w-full flex flex-col gap-8 overflow-y-auto">

        {/* Hero Banner — split layout */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center py-2">

          {/* Left: Text + AI quick-start */}
          <motion.div
            className="flex flex-col gap-5"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-accent-cyan/20 bg-accent-cyan/5 px-3 py-1 text-[11px] font-mono tracking-[0.3em] text-accent-cyan uppercase">
              Workspace Hub
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-neutral-100 leading-tight">
              Turn ideas into<br className="hidden sm:block" /> connected systems.
            </h1>
            <p className="text-base text-neutral-400 max-w-lg leading-relaxed">
              Plan architecture, map workflows, and generate visual documentation from a single collaborative canvas.
            </p>

            <div className="flex flex-col gap-2 pt-1">
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-neutral-500 mb-0.5">
                Kickstart with AI
              </p>
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handlePresetClick(preset)}
                  disabled={creating}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-dark-border bg-dark-panel/50 hover:bg-dark-panel hover:border-accent-cyan/30 text-sm text-neutral-300 hover:text-white transition-all group disabled:opacity-50 text-left"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-accent-cyan text-xs shrink-0">⚡</span>
                    <span className="group-hover:text-accent-cyan transition-colors">{preset.name}</span>
                  </span>
                  <span className="text-neutral-600 group-hover:text-neutral-400 transition-colors text-xs shrink-0">→</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Right: Animated canvas preview (desktop only) */}
          <div className="hidden lg:flex items-center justify-center">
            <CanvasPreview />
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {([
            {
              label: 'Workspaces', value: boards.length,
              color: 'text-accent-cyan', tint: 'bg-accent-cyan/[0.04]',
              icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
            },
            {
              label: 'Nodes', value: totalNodes,
              color: 'text-blue-400', tint: 'bg-blue-500/[0.04]',
              icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/></svg>,
            },
            {
              label: 'Connections', value: totalEdges,
              color: 'text-purple-400', tint: 'bg-purple-500/[0.04]',
              icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
            },
          ] as const).map(({ label, value, color, tint, icon }) => (
            <div key={label} className={`rounded-2xl border border-dark-border ${tint} p-5 backdrop-blur-sm`}>
              <div className="flex items-start justify-between">
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-neutral-500">{label}</p>
                <span className={`${color} opacity-50`}>{icon}</span>
              </div>
              <p className="mt-3 text-3xl font-bold text-white tabular-nums">{value}</p>
            </div>
          ))}
        </section>

        {/* Boards Grid */}
        <section className="flex-1 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <h2 className="text-xs font-mono tracking-widest text-neutral-500 uppercase shrink-0">
              Workspaces ({filteredBoards.length})
            </h2>
            <div className="flex gap-2.5 w-full sm:w-auto">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search workspaces..."
                className="bg-dark-panel border border-dark-border rounded-xl px-3.5 py-2 text-sm outline-none focus:border-accent-cyan/60 text-white placeholder-neutral-500 w-full sm:w-56 transition-all"
              />
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createBoard()}
                placeholder="New workspace name..."
                className="bg-dark-panel border border-dark-border rounded-xl px-3.5 py-2 text-sm outline-none focus:border-accent-cyan/60 text-white placeholder-neutral-500 w-full sm:w-56 transition-all"
              />
              <button
                onClick={() => createBoard()}
                disabled={creating || !newName.trim()}
                className="px-4 py-2 bg-gradient-to-r from-white to-neutral-200 hover:from-accent-cyan hover:to-white text-dark-bg font-semibold rounded-xl text-sm disabled:opacity-50 transition-all whitespace-nowrap"
              >
                {creating ? '...' : '+ New'}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-24 border border-dashed border-dark-border rounded-2xl">
              <span className="text-sm font-mono text-neutral-500 animate-pulse">Scanning database...</span>
            </div>
          ) : error ? (
            <div className="py-24 text-center border border-dashed border-red-900/30 rounded-2xl bg-red-950/5">
              <p className="text-sm font-mono text-red-400">{error}</p>
            </div>
          ) : filteredBoards.length === 0 && searchQuery ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 border border-dashed border-dark-border rounded-2xl bg-dark-panel/10">
              <p className="text-sm font-mono text-neutral-500">No workspaces match &quot;{searchQuery}&quot;</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* New workspace card — always first */}
              {!searchQuery && (
                <div
                  className="group relative flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-dark-border/60 bg-dark-panel/20 hover:border-accent-cyan/40 hover:bg-dark-panel/60 transition-all duration-200 gap-2.5"
                  onClick={() => {
                    const name = `Workspace ${boards.length + 1}`;
                    createBoard(name);
                  }}
                >
                  <div className="w-9 h-9 rounded-xl border border-dark-border/60 bg-dark-panel/80 flex items-center justify-center text-neutral-500 group-hover:text-accent-cyan group-hover:border-accent-cyan/40 transition-colors text-lg font-light">
                    +
                  </div>
                  <span className="text-xs font-mono text-neutral-600 group-hover:text-neutral-400 transition-colors">
                    New Workspace
                  </span>
                </div>
              )}
              {filteredBoards.map((board) => {
                const nodeCount = board.canvas_data?.nodes?.length || 0;
                const edgeCount = board.canvas_data?.edges?.length || 0;
                const isEmpty = nodeCount === 0;
                return (
                  <div
                    key={board.id}
                    onClick={() => navigate(`/board/${board.id}`)}
                    className={`group relative flex min-h-[150px] cursor-pointer flex-col justify-between rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-0.5 ${
                      isEmpty
                        ? 'border-dark-border/40 bg-dark-panel/40 opacity-60 hover:opacity-90 hover:border-dark-border/70'
                        : 'border-dark-border bg-dark-panel/80 hover:border-accent-cyan/30 hover:bg-dark-panel-hover'
                    }`}
                  >
                    <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-accent-cyan via-sky-400 to-blue-500" />

                    {nodeCount > 0 && (
                      <div className="mb-3 h-14 w-full overflow-hidden rounded-lg border border-dark-border/40 bg-dark-bg/60">
                        <BoardThumbnail nodes={board.canvas_data?.nodes ?? []} />
                      </div>
                    )}

                    <div>
                      {renamingId === board.id ? (
                        <input
                          autoFocus
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={() => handleRename(board.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename(board.id);
                            if (e.key === 'Escape') setRenamingId(null);
                            e.stopPropagation();
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full pr-8 text-base font-semibold text-white bg-transparent border-b border-accent-cyan/60 outline-none truncate"
                        />
                      ) : (
                        <h3
                          className="truncate pr-8 text-base font-semibold text-neutral-100 group-hover:text-white transition-colors cursor-text"
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            setRenamingId(board.id);
                            setRenameValue(board.name);
                          }}
                          title="Double-click to rename"
                        >
                          {board.name}
                        </h3>
                      )}
                      <div className="mt-2.5 flex items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-mono ${
                          nodeCount > 0
                            ? 'bg-accent-cyan/10 text-accent-cyan/70 border border-accent-cyan/15'
                            : 'bg-dark-panel text-neutral-600 border border-dark-border/50'
                        }`}>{nodeCount} nodes</span>
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-mono ${
                          edgeCount > 0
                            ? 'bg-blue-500/10 text-blue-400/70 border border-blue-500/15'
                            : 'bg-dark-panel text-neutral-600 border border-dark-border/50'
                        }`}>{edgeCount} edges</span>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-dark-border/40 pt-4">
                      <span className="text-xs text-neutral-500 font-mono">
                        Updated {new Date(board.updated_at).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-neutral-600 group-hover:text-neutral-400 transition-colors font-mono">→</span>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDeleteBoard(e, board.id)}
                      className="absolute right-4 top-4 rounded-lg border border-transparent p-2 text-neutral-500 opacity-0 transition-all duration-150 hover:border-red-900/30 hover:bg-red-950/30 hover:text-red-400 group-hover:opacity-100"
                      title="Delete workspace"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

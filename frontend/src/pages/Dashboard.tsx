import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, UserButton } from '@clerk/clerk-react';
import { boardsApi } from '../lib/api';

const PRESETS = [
  { name: 'React App Architecture', prompt: 'Create a micro-frontend architecture for a React ecommerce app with checkout, catalog, and auth modules' },
  { name: 'API Gateway Flow', prompt: 'Design an API Gateway routing flow with authentication, rate limiting, and caching middleware' },
  { name: 'CI/CD Pipeline', prompt: 'Create a GitHub Actions CI/CD deployment pipeline schema for a Dockerized Node.js service' },
];

export default function Dashboard() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [boards, setBoards] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');

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
    setError("Board name cannot be empty");
    return;
  }
  setCreating(true);
  setError('');
  try {
    const board = await boardsApi.create(trimmed);
    navigate(`/board/${board.id}`);
  } catch (error: any) {
    setError(
      error.response?.data?.detail ||
      "Failed to create board"
    );
  } finally {
    setCreating(false);
  }
};

  const handleDeleteBoard = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Avoid navigating to the board
    if (!confirm('Are you sure you want to delete this workspace?')) return;
    try {
      await boardsApi.delete(id);
      setBoards((prev) => prev.filter((b) => b.id !== id));
    } catch {
      alert('Failed to delete workspace');
    }
  };

  const handlePresetClick = async (preset: typeof PRESETS[0]) => {
    setCreating(true);
    try {
      // Create board with preset name
      const board = await boardsApi.create(preset.name);
      // We will pass the preset prompt to the Board page using state
      navigate(`/board/${board.id}`, { state: { autoGeneratePrompt: preset.prompt } });
    } catch {
      setError('Failed to create board from preset');
      setCreating(false);
    }
  };

  // Filter boards by search query
  const filteredBoards = boards.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen overflow-y-auto bg-dark-bg text-neutral-200 flex flex-col font-sans">
      {/* Sleek Header */}
      <header className="border-b border-dark-border px-8 py-4.5 flex items-center justify-between bg-dark-bg/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3.5">
          <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-accent-blue to-accent-cyan flex items-center justify-center font-bold text-black text-xs">
            CF
          </div>
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

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-8 py-16 pb-24 flex-1 w-full flex flex-col gap-12 overflow-y-auto">
        
        {/* Hero Banner */}
        <section className="flex flex-col gap-4 py-8">
          <h1 className="text-5xl font-bold tracking-tight text-neutral-100 leading-tight">
            Diagram with code-like precision.
          </h1>
          <p className="text-base text-neutral-400 max-w-2xl leading-relaxed">
            An AI-powered canvas built for developer workflows. Structure architecture diagrams, document systems, and generate visual roadmaps.
          </p>
        </section>

        {/* Dashboard Actions Bar */}
        <section className="flex flex-col md:flex-row gap-5 justify-between items-start md:items-center bg-dark-panel/40 p-5 rounded-xl border border-dark-border">
          <div className="flex gap-2.5 w-full md:w-auto">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workspaces..."
              className="bg-dark-panel border border-dark-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent-cyan/60 text-white placeholder-neutral-500 w-full md:w-80 transition-all"
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createBoard()}
              placeholder="New workspace name..."
              className="bg-dark-panel border border-dark-border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-accent-cyan/60 text-white placeholder-neutral-500 w-full md:w-80 transition-all"
            />
            <button
              onClick={() => createBoard()}
              disabled={creating || !newName.trim()}
              className="px-5 py-2.5 bg-neutral-100 hover:bg-white text-dark-bg font-semibold rounded-lg text-sm disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              {creating ? 'Creating...' : 'New Board'}
            </button>
          </div>
        </section>

        {/* Boards Display */}
        <section className="flex-1 flex flex-col gap-6">
          <h2 className="text-xs font-mono tracking-widest text-neutral-500 uppercase">
            Workspaces ({filteredBoards.length})
          </h2>

          {loading ? (
            <div className="flex flex-col gap-4 justify-center items-center py-24 border border-dashed border-dark-border rounded-2xl">
              <span className="text-sm font-mono text-neutral-500 animate-pulse">Scanning database...</span>
            </div>
          ) : error ? (
            <div className="py-24 text-center border border-dashed border-red-900/30 rounded-2xl bg-red-950/5">
              <p className="text-sm font-mono text-red-400">{error}</p>
            </div>
          ) : filteredBoards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 border border-dashed border-dark-border rounded-2xl bg-dark-panel/10">
              <span className="text-3xl mb-3">📁</span>
              <p className="text-base font-semibold text-neutral-300 mb-1.5">
                {searchQuery ? 'No matching workspaces' : 'No workspaces found'}
              </p>
              <p className="text-sm text-neutral-500 text-center mb-8">
                {searchQuery ? 'Try searching for something else.' : 'Get started by creating a workspace or selecting an AI preset.'}
              </p>
              
              {!searchQuery && (
                <div className="flex flex-col gap-3 w-full max-w-lg">
                  <span className="text-xs font-mono text-neutral-500 tracking-wider uppercase text-center mb-2">
                    Or kickstart with an AI workflow preset:
                  </span>
                  {PRESETS.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => handlePresetClick(p)}
                      disabled={creating}
                      className="text-left text-sm bg-dark-panel/60 hover:bg-dark-panel border border-dark-border hover:border-accent-cyan/35 px-5 py-3 rounded-lg text-neutral-300 transition-all flex items-center justify-between group"
                    >
                      <span className="group-hover:text-accent-cyan transition-colors">{p.name}</span>
                      <span className="text-xs font-mono text-neutral-500">Generate ⚡</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBoards.map((board) => (
                <div
                  key={board.id}
                  onClick={() => navigate(`/board/${board.id}`)}
                  className="bg-dark-panel hover:bg-dark-panel-hover rounded-xl border border-dark-border hover:border-dark-border-focus p-6 cursor-pointer transition-all duration-200 relative group flex flex-col justify-between min-h-[140px]"
                >
                  <div>
                    <h3 className="font-semibold text-base text-neutral-100 group-hover:text-white transition-colors truncate pr-8">
                      {board.name}
                    </h3>
                    <p className="text-sm text-neutral-400 mt-1.5 line-clamp-1">
                      {board.canvas_data?.nodes?.length || 0} nodes · {board.canvas_data?.edges?.length || 0} edges
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-5 border-t border-dark-border/40 pt-4">
                    <span className="text-xs text-neutral-500 font-mono">
                      Updated {new Date(board.updated_at).toLocaleDateString()}
                    </span>
                    <span className="text-xs bg-neutral-900 px-2 py-0.5 rounded border border-dark-border text-neutral-400 font-mono">
                      ID: {board.id.slice(0, 4)}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDeleteBoard(e, board.id)}
                    className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-2 hover:bg-red-950/30 rounded-lg text-neutral-500 hover:text-red-400 border border-transparent hover:border-red-900/30"
                    title="Delete workspace"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
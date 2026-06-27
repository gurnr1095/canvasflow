import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';
import { boardsApi } from '../../lib/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenPalette: () => void;
}

export default function Sidebar({ isOpen, onClose, onOpenPalette }: Props) {
  const navigate = useNavigate();
  const { boardId } = useParams<{ boardId: string }>();
  const { signOut } = useClerk();

  const [boards, setBoards] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      boardsApi.list()
        .then(setBoards)
        .catch(console.error)
        .finally(() => setLoading(false));
      const favs = localStorage.getItem('canvasflow_favorites');
      if (favs) setFavorites(JSON.parse(favs));
    }
  }, [isOpen]);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = favorites.includes(id)
      ? favorites.filter((fid) => fid !== id)
      : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem('canvasflow_favorites', JSON.stringify(updated));
  };

  const filteredBoards = boards.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const favBoards = boards.filter((b) => favorites.includes(b.id));
  const recentBoards = [...boards]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 3);

  if (!isOpen) return null;

  const boardItem = (b: any) => {
    const isActive = b.id === boardId;
    return (
      <button
        key={b.id}
        onClick={() => { navigate(`/board/${b.id}`); onClose(); }}
        className={`group w-full text-left px-2.5 py-2 rounded-lg text-sm flex items-center justify-between gap-2 font-sans transition-colors ${
          isActive
            ? 'bg-white/[0.07] text-white border-l-2 border-accent-cyan pl-2'
            : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.06]'
        }`}
      >
        <span className="truncate">{b.name}</span>
        <span
          onClick={(e) => toggleFavorite(e, b.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-neutral-600 hover:text-accent-cyan cursor-pointer shrink-0"
        >
          {favorites.includes(b.id) ? '★' : '☆'}
        </span>
      </button>
    );
  };

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-30 bg-black/10 backdrop-blur-[1px]" />

      <aside className="fixed left-4 top-4 bottom-4 z-40 flex w-72 flex-col overflow-hidden rounded-3xl border border-white/5 bg-dark-bg/95 shadow-[0_18px_48px_rgba(0,0,0,0.65)] backdrop-blur-xl animate-slide-in font-sans">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 p-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="CanvasFlow" className="w-6 h-6" />
            <span className="font-mono text-sm tracking-wider font-semibold text-neutral-200">
              CanvasFlow
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-white/5 hover:text-neutral-300"
            title="Collapse Sidebar"
          >
            ◀
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workspaces..."
            className="w-full rounded-xl border border-white/5 bg-neutral-900/70 px-3 py-2.5 text-xs text-neutral-200 outline-none transition-all placeholder:text-neutral-600 focus:border-accent-cyan/40"
          />
        </div>

        {/* Sections */}
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-2">

          {/* Global Search */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-neutral-600 tracking-[0.25em] px-2 uppercase">
              Global Search
            </span>
            <button
              onClick={() => { onClose(); onOpenPalette(); }}
              className="text-left px-2.5 py-2 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.06] text-sm flex items-center justify-between font-sans transition-colors"
            >
              <span className="flex items-center gap-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                Find Command
              </span>
              <kbd className="text-xs font-mono bg-neutral-900 px-2 py-0.5 rounded border border-white/5 text-neutral-500">⌘K</kbd>
            </button>
          </div>

          {/* Favorites */}
          {favBoards.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono text-neutral-600 tracking-[0.25em] px-2 uppercase">
                Favorites
              </span>
              {favBoards.map((b) => (
                <button
                  key={b.id}
                  onClick={() => { navigate(`/board/${b.id}`); onClose(); }}
                  className={`group text-left px-2.5 py-2 rounded-lg text-sm flex items-center justify-between gap-2 font-sans transition-colors ${
                    b.id === boardId ? 'bg-white/[0.07] text-white' : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.06]'
                  }`}
                >
                  <span className="truncate">{b.name}</span>
                  <span onClick={(e) => toggleFavorite(e, b.id)} className="text-xs text-accent-cyan cursor-pointer shrink-0">★</span>
                </button>
              ))}
            </div>
          )}

          {/* Recents */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-neutral-600 tracking-[0.25em] px-2 uppercase">Recents</span>
            {recentBoards.map((b) => boardItem(b))}
          </div>

          {/* All Workspaces */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-neutral-600 tracking-[0.25em] px-2 uppercase">All Workspaces</span>
            {loading ? (
              <span className="text-xs font-mono text-neutral-600 px-2 italic">Loading...</span>
            ) : filteredBoards.length === 0 ? (
              <span className="text-xs font-mono text-neutral-600 px-2 italic">No workspaces found</span>
            ) : (
              filteredBoards.map((b) => boardItem(b))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-neutral-900/40 flex flex-col gap-2.5">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 w-full py-2 bg-neutral-900 border border-white/5 rounded-lg text-xs font-mono text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
            Dashboard
          </button>
          <button
            onClick={() => signOut()}
            className="flex items-center justify-center gap-2 w-full py-2 bg-red-950/15 border border-red-900/15 hover:border-red-900/40 hover:bg-red-950/30 rounded-lg text-xs font-mono text-red-400/80 hover:text-red-300 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

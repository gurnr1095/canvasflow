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

  // Load boards on mount/open
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      boardsApi.list()
        .then(setBoards)
        .catch(console.error)
        .finally(() => setLoading(false));
      
      // Load favorites
      const favs = localStorage.getItem('canvasflow_favorites');
      if (favs) setFavorites(JSON.parse(favs));
    }
  }, [isOpen]);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    let updated = [...favorites];
    if (favorites.includes(id)) {
      updated = updated.filter((fid) => fid !== id);
    } else {
      updated.push(id);
    }
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

  return (
    <>
      {/* Backdrop to close sidebar on pane click */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 z-30 bg-black/10 backdrop-blur-[1px]" 
      />

      <aside className="fixed left-4 top-4 bottom-4 w-72 glass-panel rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-40 flex flex-col font-sans overflow-hidden animate-slide-in">
        {/* Sidebar Header */}
        <div className="p-4.5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-accent-cyan flex items-center justify-center font-mono font-bold text-black text-xs">
              CF
            </div>
            <span className="font-mono text-sm tracking-wider font-semibold text-neutral-200">
              CanvasFlow
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-300 text-sm p-1"
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
            className="w-full bg-neutral-900/60 border border-white/5 rounded-lg px-3 py-2 text-xs outline-none focus:border-accent-cyan/40 text-neutral-200 placeholder-neutral-600 transition-all font-sans"
          />
        </div>

        {/* Menu Sections */}
        <div className="flex-1 overflow-y-auto px-3 flex flex-col gap-6 py-2">
          
          {/* Quick Actions */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-mono text-neutral-600 tracking-wider px-2 uppercase">
              Global Search
            </span>
            <button
              onClick={() => {
                onClose();
                onOpenPalette();
              }}
              className="text-left px-2 py-2 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-white/5 text-sm flex items-center justify-between font-sans"
            >
              <span>🔍 Find Command</span>
              <kbd className="text-xs font-mono bg-neutral-900 px-2 py-0.5 rounded border border-white/5 text-neutral-500">⌘K</kbd>
            </button>
          </div>

          {/* Favorites */}
          {favBoards.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-mono text-neutral-600 tracking-wider px-2 uppercase">
                Favorites ⭐
              </span>
              {favBoards.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    navigate(`/board/${b.id}`);
                    onClose();
                  }}
                  className={`text-left px-2 py-2 rounded-lg text-sm flex items-center justify-between truncate font-sans group ${
                    b.id === boardId ? 'bg-white/5 text-white' : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                  }`}
                >
                  <span className="truncate">{b.name}</span>
                  <span 
                    onClick={(e) => toggleFavorite(e, b.id)}
                    className="text-xs text-accent-cyan cursor-pointer"
                  >
                    ★
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Recent Canvases */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-mono text-neutral-600 tracking-wider px-2 uppercase">
              Recents
            </span>
            {recentBoards.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  navigate(`/board/${b.id}`);
                  onClose();
                }}
                className={`text-left px-2 py-2 rounded-lg text-sm flex items-center justify-between truncate font-sans group ${
                  b.id === boardId ? 'bg-white/5 text-white animate-pulse' : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                }`}
              >
                <span className="truncate">{b.name}</span>
                <span 
                  onClick={(e) => toggleFavorite(e, b.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-neutral-600 hover:text-accent-cyan cursor-pointer"
                >
                  {favorites.includes(b.id) ? '★' : '☆'}
                </span>
              </button>
            ))}
          </div>

          {/* Workspaces List */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-mono text-neutral-600 tracking-wider px-2 uppercase">
              All Workspaces
            </span>
            {loading ? (
              <span className="text-xs font-mono text-neutral-600 px-2 italic">Loading...</span>
            ) : filteredBoards.length === 0 ? (
              <span className="text-xs font-mono text-neutral-600 px-2 italic">No workspaces found</span>
            ) : (
              filteredBoards.map((b) => (
                <button
                  key={b.id}
                  onClick={() => {
                    navigate(`/board/${b.id}`);
                    onClose();
                  }}
                  className={`text-left px-2 py-2 rounded-lg text-sm flex items-center justify-between truncate font-sans group ${
                    b.id === boardId ? 'bg-white/5 text-white border-l border-accent-cyan pl-2' : 'text-neutral-400 hover:text-neutral-200 hover:bg-white/5'
                  }`}
                >
                  <span className="truncate">{b.name}</span>
                  <span 
                    onClick={(e) => toggleFavorite(e, b.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-neutral-600 hover:text-accent-cyan cursor-pointer"
                  >
                    {favorites.includes(b.id) ? '★' : '☆'}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5 bg-neutral-900/40 flex flex-col gap-3">
          {/* Back button */}
          <button
            onClick={() => navigate('/')}
            className="w-full py-2 bg-neutral-900 border border-white/5 rounded-lg text-xs font-mono text-neutral-400 hover:text-neutral-200 hover:border-neutral-800 transition-colors"
          >
            🏠 Back to Dashboard
          </button>
          {/* Logout button */}
          <button
            onClick={() => signOut()}
            className="w-full py-2 bg-red-950/20 border border-red-900/10 hover:border-red-900/30 rounded-lg text-xs font-mono text-red-400 hover:text-red-300 transition-colors"
          >
            🚪 Log Out Clerk Session
          </button>
        </div>
      </aside>
    </>
  );
}

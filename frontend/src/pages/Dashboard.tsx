import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, UserButton } from '@clerk/clerk-react';
import { boardsApi } from '../lib/api';

export default function Dashboard() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [boards, setBoards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');

  useEffect(() => {
    boardsApi.list()
      .then(setBoards)
      .catch(() => setError('Failed to load boards'))
      .finally(() => setLoading(false));
  }, []);

  const createBoard = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    setError('');
    try {
      const board = await boardsApi.create(newName.trim());
      navigate(`/board/${board.id}`);
    } catch {
      setError('Failed to create board');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">CanvasFlow</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Hi, {user?.firstName}</span>
          <UserButton />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">My Boards</h2>
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createBoard()}
              placeholder="Board name..."
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-400"
            />
            <button
              onClick={createBoard}
              disabled={creating || !newName.trim()}
              className="px-4 py-2 bg-violet-500 text-white rounded-lg text-sm hover:bg-violet-600 disabled:opacity-50 transition-colors"
            >
              {creating ? 'Creating...' : '+ New Board'}
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-400 text-center py-20">Loading boards...</p>
        ) : error ? (
          <p className="text-red-400 text-center py-20">{error}</p>
        ) : boards.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-2">No boards yet</p>
            <p className="text-gray-300 text-sm">Create one above to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((board) => (
              <div
                key={board.id}
                onClick={() => navigate(`/board/${board.id}`)}
                className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:shadow-md hover:border-violet-300 transition-all"
              >
                <h3 className="font-semibold text-gray-800 mb-1">{board.name}</h3>
                <p className="text-xs text-gray-400">
                  {new Date(board.updated_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
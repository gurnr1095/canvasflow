import { useState } from 'react';
import { toast } from 'sonner';
import { nanoid } from 'nanoid';
import { motion, AnimatePresence } from 'framer-motion';
import { useCanvasStore } from '../../stores/canvas.store';
import { aiApi } from '../../lib/api';

export default function AIChatBar() {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const { nodes, edges, isGenerating } = useCanvasStore();

  const handleModify = async () => {
    if (!prompt.trim() || loading || isGenerating) return;
    setLoading(true);
    const toastId = toast.loading('Updating canvas…');
    try {
      const { nodes: newNodes, edges: newEdges } = await aiApi.modify(prompt, nodes, edges);

      const idMap: Record<string, string> = {};
      const updatedNodes = (newNodes || []).map((n: any) => {
        const newId = nanoid();
        idMap[n.id] = newId;
        return { ...n, id: newId };
      });
      const updatedEdges = (newEdges || []).map((e: any) => ({
        ...e,
        id: nanoid(),
        source: idMap[e.source] ?? e.source,
        target: idMap[e.target] ?? e.target,
        animated: true,
      }));

      // Add new nodes sequentially
      for (let i = 0; i < updatedNodes.length; i++) {
        if (i > 0) await new Promise((r) => setTimeout(r, 110));
        useCanvasStore.setState((s) => ({ nodes: [...s.nodes, updatedNodes[i]] }));
      }
      useCanvasStore.setState((s) => ({ edges: [...s.edges, ...updatedEdges] }));

      toast.success(`Added ${updatedNodes.length} nodes`, { id: toastId });
      setPrompt('');
      setOpen(false);
    } catch {
      toast.error('Modification failed — try again', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-14 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2 rounded-2xl border border-dark-border bg-dark-panel/95 px-3 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl"
          >
            <span className="text-accent-cyan text-xs shrink-0">✨</span>
            <input
              autoFocus
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleModify()}
              placeholder="Add a Redis cache, connect auth to router…"
              disabled={loading}
              className="w-72 bg-transparent text-sm text-white outline-none placeholder:text-neutral-600"
            />
            <button
              onClick={handleModify}
              disabled={loading || !prompt.trim()}
              className="shrink-0 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 px-3 py-1 text-xs font-semibold text-accent-cyan hover:bg-accent-cyan/20 disabled:opacity-40 transition-colors"
            >
              {loading ? '…' : 'Update'}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="shrink-0 text-neutral-600 hover:text-neutral-300 transition-colors text-sm"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!open && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full border border-dark-border/60 bg-dark-panel/80 px-3.5 py-1.5 text-xs font-mono text-neutral-500 hover:text-neutral-300 hover:border-accent-cyan/30 hover:bg-dark-panel backdrop-blur-sm transition-all"
        >
          <span className="text-accent-cyan/60">✨</span>
          Ask AI to modify canvas
        </motion.button>
      )}
    </div>
  );
}

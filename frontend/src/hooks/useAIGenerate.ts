import { toast } from 'sonner';
import { useCanvasStore } from '../stores/canvas.store';
import { aiApi } from '../lib/api';
import { nanoid } from 'nanoid';

export function useAIGenerate() {
  const { setGenerating, isGenerating } = useCanvasStore();

  const generate = async (prompt: string) => {
    if (!prompt.trim() || isGenerating) return;
    setGenerating(true);
    const toastId = toast.loading('Generating workflow…');
    try {
      const { nodes, edges } = await aiApi.generate(prompt);

      const idMap: Record<string, string> = {};
      const updatedNodes = nodes.map((n) => {
        const newId = nanoid();
        idMap[n.id] = newId;
        return { ...n, id: newId };
      });
      const updatedEdges = edges.map((e) => ({
        ...e,
        id: nanoid(),
        source: idMap[e.source],
        target: idMap[e.target],
        animated: true,
      }));

      // Add nodes one-by-one for a streaming feel
      for (let i = 0; i < updatedNodes.length; i++) {
        if (i > 0) await new Promise((r) => setTimeout(r, 110));
        useCanvasStore.setState((s) => ({ nodes: [...s.nodes, updatedNodes[i]] }));
      }
      // Add all edges after nodes are placed
      useCanvasStore.setState((s) => ({ edges: [...s.edges, ...updatedEdges] }));

      toast.success(`${updatedNodes.length} nodes generated`, { id: toastId });
    } catch (err) {
      toast.error('Generation failed — check your connection and try again', { id: toastId });
      console.error('Generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  return { generate, isGenerating };
}

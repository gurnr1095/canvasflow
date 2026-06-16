import { useCanvasStore } from '../stores/canvas.store';
import { aiApi } from '../lib/api';
import { nanoid } from 'nanoid';

export function useAIGenerate() {
  const { appendNodes, setGenerating, isGenerating } = useCanvasStore();

  const generate = async (prompt: string) => {
    if (!prompt.trim() || isGenerating) return;
    setGenerating(true);
    try {
      const { nodes, edges } = await aiApi.generate(prompt);
      
      // Re-stamp IDs so adding multiple roadmaps doesn't cause key collisions
      const idMap: Record<string, string> = {};
      const updatedNodes = nodes.map((n: any) => {
        const newId = nanoid();
        idMap[n.id] = newId;
        return { ...n, id: newId };
      });
      const updatedEdges = edges.map((e: any) => ({
        ...e,
        id: nanoid(),
        source: idMap[e.source],
        target: idMap[e.target],
      }));

      appendNodes(updatedNodes, updatedEdges);
    } catch (err) {
      console.error('Generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  return { generate, isGenerating };
}
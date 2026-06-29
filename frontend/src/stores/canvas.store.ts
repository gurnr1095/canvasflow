import { create, useStore, type StoreApi } from 'zustand';
import type { TemporalState } from 'zundo';
import { temporal } from 'zundo';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from '@xyflow/react';
import { nanoid } from 'nanoid';

interface CanvasStore {
  nodes: Node[];
  edges: Edge[];
  isGenerating: boolean;

  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  addTopicNode: (x: number, y: number) => void;
  addNoteNode: (x: number, y: number) => void;
  addWorkflowNode: (x: number, y: number) => void;
  updateNodeData: (id: string, patch: Record<string, unknown>) => void;
  deleteSelectedNodes: () => void;

  loadCanvas: (nodes: Node[], edges: Edge[]) => void;
  appendNodes: (nodes: Node[], edges: Edge[]) => void;
  setGenerating: (v: boolean) => void;
  clearCanvas: () => void;
}

export const useCanvasStore = create<CanvasStore>()(
  temporal(
    (set, get) => ({
      nodes: [],
      edges: [],
      isGenerating: false,

      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),

      onNodesChange: (changes) =>
        set((s) => ({ nodes: applyNodeChanges(changes, s.nodes) })),

      onEdgesChange: (changes) =>
        set((s) => ({ edges: applyEdgeChanges(changes, s.edges) })),

      onConnect: (connection) =>
        set((s) => ({ edges: addEdge({ ...connection, animated: true }, s.edges) })),

      addTopicNode: (x, y) =>
        set((s) => ({
          nodes: [
            ...s.nodes,
            {
              id: nanoid(),
              type: 'topic',
              position: { x, y },
              data: { label: 'New Topic', description: '', color: '#06B6D4' },
            },
          ],
        })),

      addNoteNode: (x, y) =>
        set((s) => ({
          nodes: [
            ...s.nodes,
            {
              id: nanoid(),
              type: 'note',
              position: { x, y },
              data: { title: 'New Note', content: 'Double-click to write markdown...', color: '#21262D' },
            },
          ],
        })),

      addWorkflowNode: (x, y) =>
        set((s) => ({
          nodes: [
            ...s.nodes,
            {
              id: nanoid(),
              type: 'workflow',
              position: { x, y },
              data: {
                name: 'New Node',
                status: 'pending',
                inputs: ['payload'],
                outputs: ['result'],
              },
            },
          ],
        })),

      updateNodeData: (id, patch) =>
        set((s) => ({
          nodes: s.nodes.map((n) =>
            n.id === id ? { ...n, data: { ...n.data, ...patch } } : n
          ),
        })),

      deleteSelectedNodes: () =>
        set((s) => {
          const selectedIds = new Set(
            s.nodes.filter((n) => n.selected).map((n) => n.id)
          );
          return {
            nodes: s.nodes.filter((n) => !selectedIds.has(n.id)),
            edges: s.edges.filter(
              (e) => !selectedIds.has(e.source) && !selectedIds.has(e.target)
            ),
          };
        }),

      loadCanvas: (nodes, edges) => set({ nodes, edges }),

      appendNodes: (newNodes, newEdges) =>
        set((s) => ({
          nodes: [...s.nodes, ...newNodes],
          edges: [...s.edges, ...newEdges],
        })),

      setGenerating: (v) => set({ isGenerating: v }),

      clearCanvas: () => set({ nodes: [], edges: [] }),
    }),
    {
      partialize: (state) => ({ nodes: state.nodes, edges: state.edges }),
    }
  )
);

type PartialCanvas = { nodes: Node[]; edges: Edge[] };
type TemporalStore = StoreApi<TemporalState<PartialCanvas>>;

const getTemporalStore = () =>
  (useCanvasStore as unknown as { temporal: TemporalStore }).temporal;

// Undo / redo helpers — call from event handlers without hooks
export const undoCanvas = () => getTemporalStore().getState().undo();
export const redoCanvas = () => getTemporalStore().getState().redo();

// Hook for reading temporal state in components
export const useTemporalCanvas = (): TemporalState<PartialCanvas> =>
  useStore(getTemporalStore());

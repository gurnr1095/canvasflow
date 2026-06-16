import { create } from 'zustand';
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
  updateNodeData: (id: string, patch: Record<string, unknown>) => void;
  deleteSelectedNodes: () => void;

  loadCanvas: (nodes: Node[], edges: Edge[]) => void;
  appendNodes: (nodes: Node[], edges: Edge[]) => void;   // for AI generation
  setGenerating: (v: boolean) => void;
  clearCanvas: () => void;
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
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
          data: { label: 'New Topic', description: '', color: '#93C5FD' },
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
          data: { content: 'New note...', color: '#FEF08A' },
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
}));
import type { Node, Edge } from '@xyflow/react';

export type NodeType = 'topic' | 'note' | 'ai' | 'workflow';

// ── Per-node data shapes ────────────────────────────────────────────────────

export interface AINodeData {
  label: string;
  description?: string;
  color?: string;
}

/** Topic nodes share the same data shape as AI nodes */
export type TopicData = AINodeData;

export interface NoteNodeData {
  title: string;
  content: string;
  color: string;
}

export interface WorkflowNodeData {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  inputs: string[];
  outputs: string[];
  description?: string;
}

/** Partial intersection — lets ContextPanel read any field without full type narrowing */
export type NodeDataLoose = Partial<AINodeData & NoteNodeData & WorkflowNodeData>;

// ── AI API response types ───────────────────────────────────────────────────

/** Raw node shape returned by /ai/generate and /ai/modify, before ID remapping */
export interface ApiNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

/** Raw edge shape returned by the AI API */
export interface ApiEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
}

export interface ApiCanvasResponse {
  nodes: ApiNode[];
  edges: ApiEdge[];
}

// ── Board types ─────────────────────────────────────────────────────────────

export interface BoardSummary {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

/** Board object as returned by GET /boards — includes optional canvas_data for thumbnail rendering */
export interface BoardListItem extends BoardSummary {
  canvas_data?: {
    nodes: Node[];
    edges: Edge[];
  };
}

export interface BoardDetail extends BoardSummary {
  canvas_data: {
    nodes: Node[];
    edges: Edge[];
  };
}

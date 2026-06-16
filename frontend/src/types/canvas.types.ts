export type NodeType = 'topic' | 'note' | 'ai';

export interface TopicData {
  label: string;
  description?: string;
  color: string;
}

export interface NoteData {
  content: string;
  color: string;
}

export interface AIData {
  prompt: string;
  label: string;
  color: string;
}

export type CanvasNodeData = TopicData | NoteData | AIData;

export interface BoardSummary {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface BoardDetail extends BoardSummary {
  canvas_data: {
    nodes: any[];
    edges: any[];
  };
}
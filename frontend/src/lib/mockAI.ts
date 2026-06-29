// Swap this function body for a real API call when you have a key.
// The contract (input: string prompt, output: {nodes, edges}) never changes.

import { nanoid } from 'nanoid';
import type { Node, Edge } from '@xyflow/react';

const MOCK_ROADMAPS: Record<string, { nodes: Node[]; edges: Edge[] }> = {
  default: {
    nodes: [
      { id: '1', type: 'topic', position: { x: 300, y: 50 },  data: { label: 'Fundamentals', description: 'Core concepts', color: '#93C5FD' } },
      { id: '2', type: 'topic', position: { x: 300, y: 200 }, data: { label: 'Intermediate', description: 'Build on basics', color: '#86EFAC' } },
      { id: '3', type: 'topic', position: { x: 300, y: 350 }, data: { label: 'Advanced',     description: 'Production skills', color: '#FCA5A5' } },
      { id: '4', type: 'note',  position: { x: 600, y: 200 }, data: { content: 'Practice daily!', color: '#FEF08A' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
    ],
  },
  react: {
    nodes: [
      { id: '1', type: 'topic', position: { x: 300, y: 50 },  data: { label: 'React Basics',      description: 'JSX, components, props', color: '#93C5FD' } },
      { id: '2', type: 'topic', position: { x: 300, y: 200 }, data: { label: 'Hooks',             description: 'useState, useEffect, useRef', color: '#86EFAC' } },
      { id: '3', type: 'topic', position: { x: 300, y: 350 }, data: { label: 'State Management',  description: 'Zustand / Redux Toolkit', color: '#FCA5A5' } },
      { id: '4', type: 'topic', position: { x: 300, y: 500 }, data: { label: 'Next.js',           description: 'SSR, routing, deployment', color: '#D8B4FE' } },
      { id: '5', type: 'note',  position: { x: 650, y: 275 }, data: { content: 'Build projects at each step!', color: '#FEF08A' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
      { id: 'e3-4', source: '3', target: '4', animated: true },
    ],
  },
  backend: {
    nodes: [
      { id: '1', type: 'topic', position: { x: 300, y: 50 },  data: { label: 'Python / Node.js', description: 'Pick your language', color: '#93C5FD' } },
      { id: '2', type: 'topic', position: { x: 300, y: 200 }, data: { label: 'REST APIs',        description: 'FastAPI / Express',  color: '#86EFAC' } },
      { id: '3', type: 'topic', position: { x: 300, y: 350 }, data: { label: 'Databases',        description: 'SQL + ORMs',         color: '#FCA5A5' } },
      { id: '4', type: 'topic', position: { x: 300, y: 500 }, data: { label: 'Auth + Deploy',    description: 'JWT, Docker, Cloud', color: '#D8B4FE' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
      { id: 'e3-4', source: '3', target: '4', animated: true },
    ],
  },
};

function detectTopic(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes('react') || lower.includes('frontend')) return 'react';
  if (lower.includes('backend') || lower.includes('api') || lower.includes('server')) return 'backend';
  return 'default';
}

// Simulate network delay so it feels real
function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function generateRoadmap(
  prompt: string
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  await delay(1200);

  const key = detectTopic(prompt);
  const template = MOCK_ROADMAPS[key];

  // Re-stamp IDs so adding multiple roadmaps doesn't cause key collisions
  const idMap: Record<string, string> = {};
  const nodes = template.nodes.map((n) => {
    const newId = nanoid();
    idMap[n.id] = newId;
    return { ...n, id: newId };
  });
  const edges = template.edges.map((e) => ({
    ...e,
    id: nanoid(),
    source: idMap[e.source],
    target: idMap[e.target],
  }));

  return { nodes, edges };
}
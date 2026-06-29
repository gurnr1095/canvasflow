import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCanvasStore } from '../../stores/canvas.store';
import { useReactFlow, type Edge } from '@xyflow/react';
import type { NodeDataLoose } from '../../types/canvas.types';

const NOTE_COLORS = [
  { hex: '#FEF08A', name: 'Amber' },
  { hex: '#86EFAC', name: 'Green' },
  { hex: '#6366F1', name: 'Indigo' },
  { hex: '#EC4899', name: 'Pink' },
  { hex: '#1F1F1F', name: 'Dark Gray' }
];

export default function ContextPanel() {
  const { nodes, edges, updateNodeData, setEdges, isGenerating, setGenerating, appendNodes } = useCanvasStore();
  const { deleteElements } = useReactFlow();

  // Find the selected node
  const selectedNode = nodes.find((n) => n.selected);
  
  const [localTitle, setLocalTitle] = useState('');
  const [localContent, setLocalContent] = useState('');
  const [localInputs, setLocalInputs] = useState('');
  const [localOutputs, setLocalOutputs] = useState('');
  const [aiActionLoading, setAiActionLoading] = useState(false);

  // Sync inputs when selectedNode changes
  useEffect(() => {
    if (selectedNode) {
      const data = selectedNode.data as NodeDataLoose;
      setLocalTitle(data.name || data.label || data.title || '');
      setLocalContent(data.content || data.description || '');
      setLocalInputs((data.inputs || []).join(', '));
      setLocalOutputs((data.outputs || []).join(', '));
    }
  }, [selectedNode?.id]);

  if (!selectedNode) return null;

  const nodeData = selectedNode.data as NodeDataLoose;
  const isWorkflow = selectedNode.type === 'workflow';
  const isNote = selectedNode.type === 'note';
  const isAiNode = selectedNode.type === 'topic' || selectedNode.type === 'ai';

  // Find related edges
  const connectedEdges = edges.filter(
    (e) => e.source === selectedNode.id || e.target === selectedNode.id
  );

  const getConnectedNodeName = (edge: Edge): string => {
    const targetId = edge.source === selectedNode.id ? edge.target : edge.source;
    const targetNode = nodes.find((n) => n.id === targetId);
    if (!targetNode) return 'Unknown Node';
    const data = targetNode.data as NodeDataLoose;
    return String(data.name || data.label || data.title || 'Node');
  };

  const handleUpdateField = (key: string, value: string | string[]) => {
    updateNodeData(selectedNode.id, { [key]: value });
  };

  const handleInputsBlur = () => {
    const list = localInputs
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    handleUpdateField('inputs', list);
  };

  const handleOutputsBlur = () => {
    const list = localOutputs
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    handleUpdateField('outputs', list);
  };

  const deleteEdge = (edgeId: string) => {
    setEdges(edges.filter((e) => e.id !== edgeId));
  };

  const handleGenerateSubflow = async () => {
    if (aiActionLoading) return;
    setAiActionLoading(true);
    setGenerating(true);
    
    const nodeName = nodeData.name || nodeData.label || 'Selected Topic';
    const promptText = `Generate a detailed 5-node sub-flow roadmap illustrating how to implement the step: "${nodeName}"`;
    
    try {
      const { aiApi } = await import('../../lib/api');
      const { nanoid } = await import('nanoid');
      
      const { nodes: newNodes, edges: newEdges } = await aiApi.generate(promptText);
      
      // Shift nodes to be near the selected node (e.g. x + 250)
      const currentX = selectedNode.position.x;
      const currentY = selectedNode.position.y;
      
      const idMap: Record<string, string> = {};
      const updatedNodes = newNodes.map((n, index) => {
        const newId = nanoid();
        idMap[n.id] = newId;
        return {
          ...n,
          id: newId,
          // Position relative to current selected node
          position: {
            x: currentX + 300,
            y: currentY + (index - 2) * 120,
          },
        };
      });

      // Map edges
      const updatedEdges = newEdges.map((e) => ({
        ...e,
        id: nanoid(),
        source: idMap[e.source],
        target: idMap[e.target],
      }));

      // Connect selected node to the first generated node
      if (updatedNodes.length > 0) {
        updatedEdges.push({
          id: nanoid(),
          source: selectedNode.id,
          target: updatedNodes[0].id,
          animated: true,
        });
      }

      appendNodes(updatedNodes, updatedEdges);
    } catch (err) {
      console.error('Subflow generation failed:', err);
    } finally {
      setAiActionLoading(false);
      setGenerating(false);
    }
  };

  const handleElaborateDescription = async () => {
    if (aiActionLoading) return;
    setAiActionLoading(true);
    
    const nodeName = nodeData.name || nodeData.label || 'Selected Topic';
    const promptText = `Provide a concise 2-sentence developer-oriented explanation of the concept: "${nodeName}"`;
    
    try {
      const { aiApi } = await import('../../lib/api');
      const res = await aiApi.generate(promptText);
      // The generate endpoint outputs nodes/edges, let's grab the description from the first node it generates
      if (res.nodes && res.nodes.length > 0) {
        const firstNode = res.nodes[0];
        const newDesc = String(firstNode.data?.description ?? 'Explanation generated.');
        
        if (isNote) {
          handleUpdateField('content', newDesc);
          setLocalContent(newDesc);
        } else if (isAiNode) {
          handleUpdateField('description', newDesc);
          setLocalContent(newDesc);
        } else {
          // Workflow node, we can save description in metadata or status
          handleUpdateField('description', newDesc);
        }
      }
    } catch (err) {
      console.error('Elaboration failed:', err);
    } finally {
      setAiActionLoading(false);
    }
  };

  return (
    <motion.aside
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="z-[40] flex h-full w-[360px] shrink-0 select-none flex-col overflow-y-auto border-l border-dark-border bg-[#0E0E0E] font-sans"
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-dark-border bg-neutral-900/35 px-5 py-4">
        <span className="text-xs font-mono font-semibold uppercase tracking-[0.3em] text-neutral-400">
          Node Properties
        </span>
        <span className="rounded-full border border-dark-border bg-neutral-950 px-2.5 py-1 text-[10px] font-mono text-neutral-500">
          {selectedNode.type?.toUpperCase()}
        </span>
      </div>

      {/* Editor Content Fields */}
      <div className="p-5 flex flex-col gap-6 flex-1">
        
        {/* Note Node Fields */}
        {isNote && (
          <>
            {/* Title */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-neutral-500">NOTE TITLE</label>
              <input
                value={localTitle}
                onChange={(e) => {
                  setLocalTitle(e.target.value);
                  handleUpdateField('title', e.target.value);
                }}
                className="bg-dark-panel border border-dark-border rounded-lg px-3.5 py-2 text-sm outline-none focus:border-accent-cyan/60 text-white placeholder-neutral-600 transition-all font-medium"
                placeholder="Untitled Note"
              />
            </div>

            {/* Note Content */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-neutral-500">CONTENT</label>
              <textarea
                value={localContent}
                onChange={(e) => {
                  setLocalContent(e.target.value);
                  handleUpdateField('content', e.target.value);
                }}
                className="min-h-[160px] resize-y rounded-xl border border-dark-border bg-dark-panel px-3.5 py-2.5 text-sm leading-relaxed text-white outline-none transition-all placeholder:text-neutral-600 focus:border-accent-cyan/60"
                placeholder="Write node text here..."
              />
            </div>

            {/* Color swatches */}
            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-mono text-neutral-500">ACCENT STRIPE</label>
              <div className="flex gap-2.5">
                {NOTE_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => handleUpdateField('color', c.hex)}
                    className="w-6 h-6 rounded-full border border-dark-border hover:scale-110 transition-transform relative"
                    style={{ background: c.hex }}
                    title={c.name}
                  >
                    {nodeData.color === c.hex && (
                      <span className="absolute inset-0 flex items-center justify-center text-xs text-black font-bold">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Workflow Node Fields */}
        {isWorkflow && (
          <>
            {/* Name */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-neutral-500">NODE NAME</label>
              <input
                value={localTitle}
                onChange={(e) => {
                  setLocalTitle(e.target.value);
                  handleUpdateField('name', e.target.value);
                }}
                className="bg-dark-panel border border-dark-border rounded-lg px-3.5 py-2 text-sm outline-none focus:border-accent-cyan/60 text-white placeholder-neutral-600 transition-all font-mono"
              />
            </div>

            {/* Status Dropdown */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-neutral-500">EXECUTION STATUS</label>
              <select
                value={nodeData.status || 'pending'}
                onChange={(e) => handleUpdateField('status', e.target.value)}
                className="rounded-xl border border-dark-border bg-dark-panel px-3.5 py-2.5 text-sm text-white outline-none transition-all focus:border-accent-cyan/60"
              >
                <option value="pending">Pending</option>
                <option value="running">Running</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Inputs */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-neutral-500">INPUTS (COMMA SEPARATED)</label>
              <input
                value={localInputs}
                onChange={(e) => setLocalInputs(e.target.value)}
                onBlur={handleInputsBlur}
                className="bg-dark-panel border border-dark-border rounded-lg px-3.5 py-2 text-sm outline-none focus:border-accent-cyan/60 text-white placeholder-neutral-600 transition-all font-mono"
              />
            </div>

            {/* Outputs */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-neutral-500">OUTPUTS (COMMA SEPARATED)</label>
              <input
                value={localOutputs}
                onChange={(e) => setLocalOutputs(e.target.value)}
                onBlur={handleOutputsBlur}
                className="bg-dark-panel border border-dark-border rounded-lg px-3.5 py-2 text-sm outline-none focus:border-accent-cyan/60 text-white placeholder-neutral-600 transition-all font-mono"
              />
            </div>
          </>
        )}

        {/* AI Node Fields */}
        {isAiNode && (
          <>
            {/* Label */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-neutral-500">CONCEPT LABEL</label>
              <input
                value={localTitle}
                onChange={(e) => {
                  setLocalTitle(e.target.value);
                  handleUpdateField('label', e.target.value);
                }}
                className="bg-dark-panel border border-dark-border rounded-lg px-3.5 py-2 text-sm outline-none focus:border-accent-cyan/60 text-white placeholder-neutral-600 transition-all font-medium"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-neutral-500">EXPLANATION</label>
              <textarea
                value={localContent}
                onChange={(e) => {
                  setLocalContent(e.target.value);
                  handleUpdateField('description', e.target.value);
                }}
                className="bg-dark-panel border border-dark-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-accent-cyan/60 text-white placeholder-neutral-600 transition-all min-h-[120px] resize-y font-sans leading-relaxed"
                placeholder="Concept details..."
              />
            </div>
          </>
        )}

        {/* AI Actions Section */}
        <div className="flex flex-col gap-3 border-t border-dark-border/60 pt-5">
          <label className="text-[10px] font-mono text-neutral-500 tracking-[0.25em] uppercase">AI Agent Actions</label>
          <div className="flex flex-col gap-2">
            {(isAiNode || isWorkflow) && (
              <button
                onClick={handleGenerateSubflow}
                disabled={aiActionLoading || isGenerating}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-accent-cyan/20 bg-accent-cyan/[0.05] px-3.5 py-3 text-left text-sm text-neutral-200 transition-all hover:border-accent-cyan/40 hover:bg-accent-cyan/[0.1] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-accent-cyan">✨</span>
                  <span>Generate Sub-flow Roadmap</span>
                </span>
                <span className={`text-xs font-mono shrink-0 ${aiActionLoading ? 'text-accent-cyan/60 animate-pulse' : 'text-accent-cyan/50'}`}>
                  {aiActionLoading ? '...' : '⚡'}
                </span>
              </button>
            )}
            <button
              onClick={handleElaborateDescription}
              disabled={aiActionLoading || isGenerating}
              className="flex w-full items-center justify-between gap-2 rounded-xl border border-accent-cyan/20 bg-accent-cyan/[0.05] px-3.5 py-3 text-left text-sm text-neutral-200 transition-all hover:border-accent-cyan/40 hover:bg-accent-cyan/[0.1] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="flex items-center gap-2.5">
                <span className="text-accent-cyan">📝</span>
                <span>AI Explain / Elaborate</span>
              </span>
              <span className={`text-xs font-mono shrink-0 ${aiActionLoading ? 'text-accent-cyan/60 animate-pulse' : 'text-accent-cyan/50'}`}>
                {aiActionLoading ? '...' : '⚡'}
              </span>
            </button>
          </div>
        </div>

        {/* Node Connections List */}
        <div className="flex flex-col gap-3 border-t border-dark-border/60 pt-5 flex-1">
          <label className="text-xs font-mono text-neutral-500">
            CONNECTIONS ({connectedEdges.length})
          </label>
          <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto">
            {connectedEdges.length === 0 ? (
              <span className="text-xs font-mono text-neutral-600 italic select-none">No active wire connections</span>
            ) : (
              connectedEdges.map((edge) => (
                <div
                  key={edge.id}
                  className="group flex items-center justify-between rounded-xl border border-dark-border/50 bg-dark-panel/60 px-3 py-2 text-xs font-mono text-neutral-400"
                >
                  <span className="truncate max-w-[220px]" title={getConnectedNodeName(edge)}>
                    {edge.source === selectedNode.id ? '→ ' : '← '} {getConnectedNodeName(edge)}
                  </span>
                  <button
                    onClick={() => deleteEdge(edge.id)}
                    className="text-neutral-500 hover:text-red-400 opacity-60 group-hover:opacity-100 transition-all font-mono text-sm px-1"
                    title="Sever connection"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Delete button */}
        <button
          onClick={() => deleteElements({ nodes: [selectedNode] })}
          className="mt-auto w-full rounded-xl border border-red-900/30 bg-red-950/20 py-2.5 text-sm font-mono text-red-400 transition-all hover:border-red-900/60 hover:bg-red-950/45 hover:text-red-300"
        >
          🗑 Delete Node
        </button>

      </div>
    </motion.aside>
  );
}

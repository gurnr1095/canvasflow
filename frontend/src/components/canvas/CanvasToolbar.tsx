import { useState } from 'react';
import { useCanvasStore } from '../../stores/canvas.store';
import { useAIGenerate } from '../../hooks/useAIGenerate';

interface Props {
  onSave: () => void;
  isSaving: boolean;
}

export default function CanvasToolbar({ onSave, isSaving }: Props) {
  const [prompt, setPrompt] = useState('');
  const { addTopicNode, addNoteNode, clearCanvas, nodes, edges } = useCanvasStore();
  const { generate, isGenerating } = useAIGenerate();

  const handleGenerate = async () => {
    await generate(prompt);
    setPrompt('');
  };

  return (
    <div
      data-toolbar
      className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-white rounded-2xl shadow-lg border border-gray-200 px-4 py-2"
    >
      {/* AI Input */}
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
        placeholder="Generate a roadmap... (e.g. React learning path)"
        className="w-72 text-sm outline-none text-gray-700 placeholder-gray-400"
        disabled={isGenerating}
      />
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        className="px-3 py-1.5 bg-violet-500 text-white text-sm rounded-lg hover:bg-violet-600 disabled:opacity-50 transition-colors"
      >
        {isGenerating ? '...' : '✨ Generate'}
      </button>

      <div className="w-px h-6 bg-gray-200" />

      {/* Manual add */}
      <button
        onClick={() => addTopicNode(200, 200)}
        className="px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        title="Add Topic Node"
      >
        📘 Topic
      </button>
      <button
        onClick={() => addNoteNode(200, 200)}
        className="px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        title="Add Note"
      >
        📝 Note
      </button>

      <div className="w-px h-6 bg-gray-200" />

      {/* Save */}
      <button
        onClick={onSave}
        disabled={isSaving}
        className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
      >
        {isSaving ? 'Saving...' : '💾 Save'}
      </button>

      <div className="w-px h-6 bg-gray-200" />

      {/* Clear */}
      <button
        onClick={() => {
          if (nodes.length === 0) return;
          clearCanvas();
        }}
        disabled={nodes.length === 0}
        className="px-2 py-1.5 text-sm text-red-400 hover:bg-red-50 rounded-lg disabled:opacity-30 transition-colors"
        title="Clear Canvas"
      >
        🗑 Clear
      </button>

      {/* Node count */}
      <span className="text-xs text-gray-400">
        {nodes.length}N · {edges.length}E
      </span>
    </div>
  );
}
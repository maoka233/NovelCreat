import React, { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { useKnowledgeStore } from '../stores/knowledgeStore';
import { OutlineGenerator } from '../services/OutlineGenerator';
import { DeepSeekService } from '../services/DeepSeekService';

const engine = new OutlineGenerator(new DeepSeekService());

const OutlineGeneratorPanel: React.FC = () => {
  const { outline, setOutline } = useKnowledgeStore();
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState('赛博朋克');
  const [loading, setLoading] = useState(false);
  const [refining, setRefining] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const generated = await engine.generateFromDescription(description, style);
      setOutline(generated);
    } finally {
      setLoading(false);
    }
  };

  const handleRefine = async () => {
    if (!outline) return;
    setRefining(true);
    try {
      // 这里真正调用 OutlineGenerator.refineOutline
      const refined = await engine.refineOutline(outline, '更多悬疑感');
      setOutline(refined);
    } catch (error) {
      console.error('[OutlineGenerator] refine failed:', error);
    } finally {
      setRefining(false);
    }
  };

  return (
    <div className="glow-card p-4 space-y-3 fade-enter">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">故事大纲</p>
          <h3 className="text-xl font-semibold">AI 大纲生成器</h3>
        </div>
        <div className="flex gap-2">
          <button
            className="inline-flex items-center gap-1 px-3 py-2 bg-accent text-white rounded-lg hover:opacity-90 transition"
            onClick={handleGenerate}
            disabled={loading}
          >
            <Sparkles size={16} /> 生成大纲
          </button>
          <button
            className="inline-flex items-center gap-1 px-3 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition"
            onClick={handleRefine}
            disabled={!outline || refining}
          >
            <RefreshCw size={16} />
            {refining ? '细化中...' : '细化'}
          </button>
        </div>
      </div>

      <textarea
        className="w-full h-32 bg-panel/60 rounded-lg p-3 text-sm focus:outline-none border border-white/5"
        placeholder="用一两句话描述你想写的故事..."
        value={description}
        onChange={e => setDescription(e.target.value)}
      />

      {outline && (
        <div className="bg-panel/60 rounded-lg p-3 text-sm border border-white/5 space-y-2">
          <h4 className="font-medium">{outline.title}</h4>
          <p className="text-gray-400">{outline.premise}</p>
        </div>
      )}

      {loading && <p className="text-sm text-accent pulse">AI 正在生成大纲...</p>}
    </div>
  );
};

export default OutlineGeneratorPanel;

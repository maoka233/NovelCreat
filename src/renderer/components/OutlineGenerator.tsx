import React, { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { OutlineGenerator as OutlineEngine } from '../services/OutlineGenerator';
import { DeepSeekService } from '../services/DeepSeekService';
import { useKnowledgeStore } from '../stores/knowledgeStore';

const deepseek = new DeepSeekService();
const engine = new OutlineEngine(deepseek);

const OutlineGenerator: React.FC = () => {
  const [description, setDescription] = useState('一位迷失在赛博城市的赏金猎人');
  const [style, setStyle] = useState('赛博朋克');
  const [loading, setLoading] = useState(false);
  const { outline, setOutline } = useKnowledgeStore();

  const handleGenerate = async () => {
    setLoading(true);
    const generated = await engine.generateFromDescription(description, style);
    setOutline(generated);
    setLoading(false);
  };

  return (
    <div className="glow-card p-4 space-y-3 fade-enter">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2"><Sparkles size={18} /> 智能大纲生成</h2>
        <button
          className="px-3 py-1 text-sm rounded-full bg-accent text-white hover:opacity-90 transition"
          onClick={handleGenerate}
        >
          {loading ? '生成中...' : '生成大纲'}
        </button>
      </div>
      <textarea
        className="w-full bg-panel/60 rounded-lg p-3 text-sm focus:outline-none border border-white/5"
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="输入故事描述"
      />
      <div className="flex items-center gap-2">
        <input
          className="flex-1 bg-panel/60 rounded-lg p-2 text-sm border border-white/5"
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          placeholder="写作风格"
        />
        <button
          className="inline-flex items-center gap-1 px-3 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition"
          onClick={() => outline && engine.refineOutline(outline, '更多悬疑感').then(setOutline)}
          disabled={!outline}
        >
          <RefreshCw size={16} /> 细化
        </button>
      </div>
      {outline && (
        <div className="bg-black/20 rounded-lg p-3 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold">当前大纲</p>
            <span className="text-xs text-gray-400">{outline.genre}</span>
          </div>
          <p className="text-sm text-gray-200 whitespace-pre-line">{outline.premise}</p>
        </div>
      )}
    </div>
  );
};

export default OutlineGenerator;

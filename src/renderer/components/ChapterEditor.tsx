import React, { useEffect, useMemo, useState } from 'react';
import { Wand2, Sparkle, PenLine } from 'lucide-react';
import { useKnowledgeStore } from '../stores/knowledgeStore';
import { ContextManager } from '../services/ContextManager';
import { DeepSeekService } from '../services/DeepSeekService';

const deepseek = new DeepSeekService();
const contextManager = new ContextManager();

interface Props {
  activeIndex: number | null;
}

const ChapterEditor: React.FC<Props> = ({ activeIndex }) => {
  const { chapters, setChapters, outline, chapterSummaries } = useKnowledgeStore();
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);

  const chapter = useMemo(() => (activeIndex !== null ? chapters[activeIndex] : null), [
    activeIndex,
    chapters
  ]);

  useEffect(() => {
    setDraft(chapter?.content || '');
  }, [chapter]);

  if (!chapter) return <div className="glow-card p-4 text-gray-400">选择章节开始创作</div>;

  const updateChapter = (content: string) => {
    const updated = [...chapters];
    updated[activeIndex!] = { ...chapter, content };
    setChapters(updated);
  };

  const runGeneration = async (mode: 'generate' | 'rewrite' | 'polish') => {
    setLoading(true);
    const knowledgeBase = {
      outline,
      characterCards: [],
      worldSettings: [],
      chapterSummaries,
      plotPoints: [],
      consistencyRules: []
    };
    const context = await contextManager.buildGenerationContext(
      knowledgeBase as any,
      activeIndex ?? 0
    );
    const constrainedContext = deepseek.enforceTokenLimit(context);

    let content = draft;
    if (mode === 'generate') {
      const prompt = `继续撰写章节：${chapter.title}`;
      const generated = await deepseek.generateChapter(prompt, constrainedContext);
      content = generated.body;
    }
    if (mode === 'rewrite') {
      content = await deepseek.rewriteChapter(draft, '提升节奏与张力');
    }
    if (mode === 'polish') {
      content = await deepseek.polishChapter(draft);
    }
    updateChapter(content);
    setDraft(content);
    setLoading(false);
  };

  return (
    <div className="glow-card p-4 space-y-3 fade-enter">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">章节编辑</p>
          <h3 className="text-xl font-semibold">{chapter.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => runGeneration('generate')}
            className="inline-flex items-center gap-1 px-3 py-2 bg-accent text-white rounded-lg hover:opacity-90 transition"
          >
            <Sparkle size={16} /> 生成
          </button>
          <button
            onClick={() => runGeneration('rewrite')}
            className="inline-flex items-center gap-1 px-3 py-2 bg-white/5 rounded-lg hover:bg-white/10"
          >
            <Wand2 size={16} /> 重写
          </button>
          <button
            onClick={() => runGeneration('polish')}
            className="inline-flex items-center gap-1 px-3 py-2 bg-white/5 rounded-lg hover:bg-white/10"
          >
            <PenLine size={16} /> 润色
          </button>
        </div>
      </div>
      <textarea
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          updateChapter(e.target.value);
        }}
        className="w-full h-72 bg-panel/60 rounded-lg p-3 text-sm focus:outline-none border border-white/5"
      />
      {loading && <p className="text-sm text-accent pulse">AI 正在处理...</p>}
    </div>
  );
};

export default ChapterEditor;

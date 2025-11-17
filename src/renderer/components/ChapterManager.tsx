import React from 'react';
import { ListTree, Plus } from 'lucide-react';
import { useKnowledgeStore } from '../stores/knowledgeStore';

interface Props {
  onSelectChapter: (index: number) => void;
}

const ChapterManager: React.FC<Props> = ({ onSelectChapter }) => {
  const { chapters, setChapters } = useKnowledgeStore();

  const addChapter = () => {
    const newChapter = {
      id: crypto.randomUUID(),
      title: `章节 ${chapters.length + 1}`,
      content: ''
    };
    setChapters([...chapters, newChapter]);
    onSelectChapter(chapters.length);
  };

  return (
    <div className="glow-card p-4 space-y-3 fade-enter">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <ListTree size={18} /> 章节管理
        </h3>
        <button
          className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-white/5 rounded-lg hover:bg-white/10"
          onClick={addChapter}
        >
          <Plus size={16} /> 新建
        </button>
      </div>
      <ul className="space-y-2">
        {chapters.map((chapter, idx) => (
          <li key={chapter.id}>
            <button
              onClick={() => onSelectChapter(idx)}
              className="w-full text-left px-3 py-2 rounded-lg bg-panel/60 hover:bg-white/5 transition"
            >
              <p className="font-medium">{chapter.title}</p>
              <p className="text-xs text-gray-400 line-clamp-1">{chapter.content || '暂无内容'}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChapterManager;

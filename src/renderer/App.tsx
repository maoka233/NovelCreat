import React, { useState } from 'react';
import OutlineGenerator from './components/OutlineGenerator';
import ChapterManager from './components/ChapterManager';
import ChapterEditor from './components/ChapterEditor';
import StyleSelector from './components/StyleSelector';

const App: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [style, setStyle] = useState('赛博朋克');

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface via-surface to-black text-gray-100">
      <header className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 tracking-wide">AI 辅助小说创作</p>
          <h1 className="text-2xl font-bold">Novel Writer Studio</h1>
        </div>
        <div className="text-sm text-gray-400">深色主题 · 动画过渡 · Electron</div>
      </header>
      <main className="grid grid-cols-3 gap-4 p-6">
        <div className="space-y-4">
          <StyleSelector value={style} onChange={setStyle} />
          <OutlineGenerator />
          <ChapterManager onSelectChapter={setActiveIndex} />
        </div>
        <div className="col-span-2">
          <ChapterEditor activeIndex={activeIndex} />
        </div>
      </main>
    </div>
  );
};

export default App;

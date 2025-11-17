import React from 'react';
import { Palette } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const styles = ['赛博朋克', '史诗奇幻', '浪漫言情', '悬疑推理'];

const StyleSelector: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="glow-card p-4 space-y-2">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Palette size={16} /> 写作风格
      </div>
      <div className="flex flex-wrap gap-2">
        {styles.map(style => (
          <button
            key={style}
            onClick={() => onChange(style)}
            className={`px-3 py-1 rounded-full text-sm border border-white/5 transition ${
              value === style ? 'bg-accent text-white' : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            {style}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StyleSelector;

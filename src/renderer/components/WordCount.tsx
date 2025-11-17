import React from 'react';
import { FileText, Target } from 'lucide-react';
import { useEditorStore, calculateProgress } from '../stores/editorStore';
import { formatWordCount } from '../utils/format';

/**
 * Word count component displaying current word count and progress
 */
const WordCount: React.FC = () => {
  const { wordCount, targetWordCount, estimatedReadTime } = useEditorStore();
  const progress = calculateProgress(wordCount, targetWordCount);

  return (
    <div className="bg-white/5 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-gray-400">字数统计</span>
        </div>
        <span className="text-lg font-semibold text-white">{formatWordCount(wordCount)}</span>
      </div>

      {targetWordCount > 0 && (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3 text-green-400" />
                <span className="text-gray-400">目标</span>
              </div>
              <span className="text-gray-300">{formatWordCount(targetWordCount)}</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{progress}% 完成</span>
              {wordCount < targetWordCount && (
                <span>还需 {formatWordCount(targetWordCount - wordCount)}</span>
              )}
            </div>
          </div>
        </>
      )}

      {estimatedReadTime > 0 && (
        <div className="pt-2 border-t border-white/10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">预计阅读时间</span>
            <span className="text-gray-300">约 {estimatedReadTime} 分钟</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordCount;

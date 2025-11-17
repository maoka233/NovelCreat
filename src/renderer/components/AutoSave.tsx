import React from 'react';
import { Save, Check, Loader2, AlertCircle } from 'lucide-react';
import { useEditorStore } from '../stores/editorStore';
import { formatRelativeTime } from '../utils/format';

interface AutoSaveProps {
  onSave?: () => void;
}

/**
 * Auto-save indicator component showing save status
 */
const AutoSave: React.FC<AutoSaveProps> = ({ onSave }) => {
  const { lastSaved, isSaving, isDirty, autoSaveEnabled, toggleAutoSave } = useEditorStore();

  const getSaveStatus = () => {
    if (isSaving) {
      return {
        icon: <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />,
        text: '保存中...',
        color: 'text-blue-400'
      };
    }

    if (isDirty) {
      return {
        icon: <AlertCircle className="w-4 h-4 text-yellow-400" />,
        text: '未保存',
        color: 'text-yellow-400'
      };
    }

    if (lastSaved) {
      return {
        icon: <Check className="w-4 h-4 text-green-400" />,
        text: `已保存 · ${formatRelativeTime(lastSaved)}`,
        color: 'text-green-400'
      };
    }

    return {
      icon: <Save className="w-4 h-4 text-gray-400" />,
      text: '未保存',
      color: 'text-gray-400'
    };
  };

  const status = getSaveStatus();

  return (
    <div className="flex items-center gap-4">
      {/* Save status */}
      <div className="flex items-center gap-2">
        {status.icon}
        <span className={`text-sm ${status.color}`}>{status.text}</span>
      </div>

      {/* Manual save button */}
      {onSave && (
        <button
          onClick={onSave}
          disabled={isSaving || !isDirty}
          className="px-3 py-1 text-sm rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="手动保存"
        >
          <Save className="w-4 h-4" />
        </button>
      )}

      {/* Auto-save toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={autoSaveEnabled}
          onChange={toggleAutoSave}
          className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
        />
        <span className="text-sm text-gray-400">自动保存</span>
      </label>
    </div>
  );
};

export default AutoSave;

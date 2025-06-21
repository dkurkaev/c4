import React from 'react';
import { ContextMenuState } from '../../types';

interface ContextMenuProps {
  contextMenu: ContextMenuState;
  onCreateNew: () => void;
  onExport: () => void;
  onDelete: () => void;
  canDeleteNode: (node: any) => boolean;
  saving: boolean;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  contextMenu,
  onCreateNew,
  onExport,
  onDelete,
  canDeleteNode,
  saving
}) => {
  if (!contextMenu.visible) return null;

  return (
    <div 
      className="fixed bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50"
      style={{ left: contextMenu.x, top: contextMenu.y }}
    >
      {contextMenu.node?.type === 'group' && (
        <button
          onClick={onCreateNew}
          className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Создать новый элемент
        </button>
      )}
      
      <button
        onClick={onExport}
        disabled={saving}
        className={`w-full text-left px-4 py-2 flex items-center ${
          !saving
            ? 'hover:bg-gray-100 text-gray-700' 
            : 'text-gray-400 cursor-not-allowed'
        }`}
        title="Экспортировать в draw.io"
      >
        {saving ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
        ) : (
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
        Экспорт
      </button>
      
      <button
        onClick={onDelete}
        disabled={!canDeleteNode(contextMenu.node!)}
        className={`w-full text-left px-4 py-2 flex items-center ${
          canDeleteNode(contextMenu.node!) 
            ? 'hover:bg-red-50 text-red-600' 
            : 'text-gray-400 cursor-not-allowed'
        }`}
        title={
          !canDeleteNode(contextMenu.node!) 
            ? 'Невозможно удалить элемент с дочерними элементами' 
            : 'Удалить элемент'
        }
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Удалить
      </button>
    </div>
  );
};

export default ContextMenu; 
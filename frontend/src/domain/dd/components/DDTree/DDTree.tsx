import React from 'react';
import TreeNode from './TreeNode';
import ContextMenu from './ContextMenu';
import { DDTreeNode, DragState, ContextMenuState } from '../../types';

interface DDTreeProps {
  ddTree: DDTreeNode[];
  dragState: DragState;
  contextMenu: ContextMenuState;
  saving: boolean;
  onNodeSelect: (node: DDTreeNode) => void;
  onContextMenu: (e: React.MouseEvent, node: DDTreeNode) => void;
  onDragStart: (e: React.DragEvent, node: DDTreeNode) => void;
  onDragOver: (e: React.DragEvent, node: DDTreeNode) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, node: DDTreeNode) => void;
  onDragEnd: () => void;
  onCreateNew: () => void;
  onExport: () => void;
  onDelete: () => void;
  canDeleteNode: (node: DDTreeNode) => boolean;
}

const DDTree: React.FC<DDTreeProps> = ({
  ddTree,
  dragState,
  contextMenu,
  saving,
  onNodeSelect,
  onContextMenu,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onCreateNew,
  onExport,
  onDelete,
  canDeleteNode
}) => {
  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Компоненты развертывания</h2>
          <p className="text-sm text-gray-600 mt-1">
            Иерархическое дерево групп и компонентов системы
          </p>
        </div>
        
        <div className="p-4">
          {ddTree.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p>Нет доступных компонентов</p>
            </div>
          ) : (
            <div className="space-y-1">
              {ddTree.map((node) => (
                <TreeNode 
                  key={node.id} 
                  node={node} 
                  level={0} 
                  onNodeSelect={onNodeSelect} 
                  onContextMenu={onContextMenu} 
                  onDragStart={onDragStart} 
                  onDragOver={onDragOver} 
                  onDragLeave={onDragLeave} 
                  onDrop={onDrop} 
                  onDragEnd={onDragEnd} 
                  isDragOver={dragState.dragOverNode?.id === node.id} 
                  isDragging={dragState.draggedNode?.id === node.id} 
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ContextMenu
        contextMenu={contextMenu}
        onCreateNew={onCreateNew}
        onExport={onExport}
        onDelete={onDelete}
        canDeleteNode={canDeleteNode}
        saving={saving}
      />
    </>
  );
};

export default DDTree; 
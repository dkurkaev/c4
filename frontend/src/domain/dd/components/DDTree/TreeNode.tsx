import React, { useState } from 'react';
import { DDTreeNode } from '../../types';

interface TreeNodeProps {
  node: DDTreeNode;
  level: number;
  onNodeSelect: (node: DDTreeNode) => void;
  onContextMenu: (e: React.MouseEvent, node: DDTreeNode) => void;
  onDragStart: (e: React.DragEvent, node: DDTreeNode) => void;
  onDragOver: (e: React.DragEvent, node: DDTreeNode) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, node: DDTreeNode) => void;
  onDragEnd: () => void;
  isDragOver: boolean;
  isDragging: boolean;
}

const TreeNode: React.FC<TreeNodeProps> = ({ 
  node, 
  level, 
  onNodeSelect, 
  onContextMenu, 
  onDragStart, 
  onDragOver, 
  onDragLeave, 
  onDrop, 
  onDragEnd, 
  isDragOver, 
  isDragging 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="select-none">
      <div 
        className={`flex items-center py-2 px-3 cursor-pointer rounded-md transition-colors ${
          isDragging 
            ? 'opacity-50 bg-blue-100 border-2 border-dashed border-blue-300' 
            : isDragOver 
              ? 'bg-green-100 border-2 border-dashed border-green-400' 
              : 'hover:bg-gray-50'
        }`}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
        draggable
        onDragStart={(e) => onDragStart(e, node)}
        onDragOver={(e) => onDragOver(e, node)}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, node)}
        onDragEnd={onDragEnd}
        onClick={(e) => {
          e.stopPropagation();
          if (hasChildren) {
            setIsExpanded(!isExpanded);
          }
          onNodeSelect(node);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onContextMenu(e, node);
        }}
      >
        {hasChildren && (
          <svg 
            className={`w-4 h-4 mr-2 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
        {!hasChildren && <div className="w-4 h-4 mr-2" />}
        
        {/* Иконка в зависимости от типа */}
        {node.type === 'group' ? (
          // Иконка группы - пунктирный квадрат
          <svg 
            className="w-4 h-4 mr-2 text-black" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <rect 
              x="3" 
              y="3" 
              width="18" 
              height="18" 
              strokeWidth={2} 
              strokeDasharray="4 2"
              rx="2"
            />
          </svg>
        ) : (
          // Иконка компонента - скругленный квадрат
          <svg 
            className="w-4 h-4 mr-2" 
            fill="#23A2D9" 
            stroke="#23A2D9" 
            viewBox="0 0 24 24"
          >
            <rect 
              x="3" 
              y="3" 
              width="18" 
              height="18" 
              strokeWidth={2} 
              rx="4"
            />
          </svg>
        )}
        
        <span className="text-gray-700">{node.name}</span>
        
        {/* Индикатор перетаскивания */}
        {isDragging && (
          <svg className="w-4 h-4 ml-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        )}
      </div>
      
      {hasChildren && isExpanded && (
        <div className="ml-2">
          {node.children!.map((child) => (
            <TreeNode 
              key={child.id} 
              node={child} 
              level={level + 1} 
              onNodeSelect={onNodeSelect} 
              onContextMenu={onContextMenu} 
              onDragStart={onDragStart} 
              onDragOver={onDragOver} 
              onDragLeave={onDragLeave} 
              onDrop={onDrop} 
              onDragEnd={onDragEnd} 
              isDragOver={false} 
              isDragging={false} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNode; 
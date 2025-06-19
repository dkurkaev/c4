import React, { useState } from 'react';

export function GroupTree({ groups }) {
  const [expandedNodes, setExpandedNodes] = useState(new Set(['root']));

  if (!groups || groups.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        <svg style={{ width: '48px', height: '48px' }} className="mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <p>Группы DD не найдены</p>
      </div>
    );
  }

  // Строим иерархию групп
  const buildHierarchy = (groups) => {
    const groupMap = {};
    const rootGroups = [];

    // Создаем карту групп
    groups.forEach(group => {
      groupMap[group.id] = { ...group, children: [] };
    });

    // Строим иерархию
    groups.forEach(group => {
      if (group.parent_id && groupMap[group.parent_id]) {
        groupMap[group.parent_id].children.push(groupMap[group.id]);
      } else {
        rootGroups.push(groupMap[group.id]);
      }
    });

    return rootGroups;
  };

  const hierarchicalGroups = buildHierarchy(groups);

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderTreeItem = (group, level = 0) => {
    const hasChildren = group.children && group.children.length > 0;
    const isExpanded = expandedNodes.has(group.id);
    const paddingLeft = level * 20;
    
    return (
      <div key={group.id}>
        <div 
          className="flex items-center py-2 px-3 cursor-pointer rounded-lg"
          style={{ 
            paddingLeft: `${paddingLeft}px`,
            backgroundColor: isExpanded ? '#f9fafb' : 'transparent'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
          onMouseLeave={(e) => e.target.style.backgroundColor = isExpanded ? '#f9fafb' : 'transparent'}
          onClick={() => hasChildren && toggleNode(group.id)}
        >
          {hasChildren ? (
            <svg 
              style={{ 
                width: '12px', 
                height: '12px', 
                marginRight: '8px',
                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.15s ease'
              }}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          ) : (
            <div style={{ width: '12px', height: '12px', marginRight: '8px' }} />
          )}
          
          <svg 
            style={{ width: '16px', height: '16px', marginRight: '8px' }}
            className="text-blue-500"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" 
            />
          </svg>
          
          <span className="text-sm text-gray-800">
            {group.name || `Группа ${group.id}`}
          </span>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {group.children.map(child => renderTreeItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Структура групп DD</h3>
      </div>
      <div className="p-4">
        <div>
          {hierarchicalGroups.map(group => renderTreeItem(group))}
        </div>
      </div>
    </div>
  );
} 
import React, { useState } from 'react';
import { NodeDetailsCard } from './NodeDetailsCard';

export function GroupTree({ groups, components }) {
  const [expandedNodes, setExpandedNodes] = useState(new Set(['root']));
  const [selectedNode, setSelectedNode] = useState(null);

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

  // Строим иерархию групп и добавляем компоненты
  const buildHierarchy = (groups, components = []) => {
    const groupMap = {};
    const rootGroups = [];

    // Создаем карту групп
    groups.forEach(group => {
      groupMap[group.id] = { ...group, children: [], components: [] };
    });

    // Добавляем компоненты к соответствующим группам
    if (components) {
      components.forEach(component => {
        if (groupMap[component.group_id]) {
          groupMap[component.group_id].components.push({
            ...component,
            type: 'component' // Помечаем как компонент
          });
        }
      });
    }

    // Строим иерархию групп
    groups.forEach(group => {
      if (group.parent_id && groupMap[group.parent_id]) {
        groupMap[group.parent_id].children.push(groupMap[group.id]);
      } else {
        rootGroups.push(groupMap[group.id]);
      }
    });

    return rootGroups;
  };

  const hierarchicalGroups = buildHierarchy(groups, components);

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const selectNode = (node, type) => {
    setSelectedNode({ ...node, nodeType: type });
  };

  const renderComponent = (component, level) => {
    const paddingLeft = level * 20;
    const isSelected = selectedNode && selectedNode.id === component.id && selectedNode.nodeType === 'component';
    
    return (
      <div key={`component-${component.id}`}>
        <div 
          className={`flex items-center py-2 px-3 rounded-lg cursor-pointer ${
            isSelected ? 'bg-blue-100 border-l-4 border-blue-500' : ''
          }`}
          style={{ 
            paddingLeft: `${paddingLeft}px`,
            backgroundColor: isSelected ? '#dbeafe' : 'transparent'
          }}
          onMouseEnter={(e) => !isSelected && (e.target.style.backgroundColor = '#f3f4f6')}
          onMouseLeave={(e) => !isSelected && (e.target.style.backgroundColor = 'transparent')}
          onClick={() => selectNode(component, 'component')}
        >
          {/* Отступ для стрелки */}
          <div style={{ width: '12px', height: '12px', marginRight: '8px' }} />
          
          {/* Иконка компонента - круг */}
          <svg 
            style={{ width: '16px', height: '16px', marginRight: '8px' }}
            className="text-green-500"
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" />
          </svg>
          
          <span className="text-sm text-gray-700">
            {component.name || `Компонент ${component.id}`}
          </span>
        </div>
      </div>
    );
  };

  const renderTreeItem = (group, level = 0) => {
    const hasChildren = (group.children && group.children.length > 0) || (group.components && group.components.length > 0);
    const isExpanded = expandedNodes.has(group.id);
    const isSelected = selectedNode && selectedNode.id === group.id && selectedNode.nodeType === 'group';
    const paddingLeft = level * 20;
    
    return (
      <div key={group.id}>
        <div 
          className={`flex items-center py-2 px-3 cursor-pointer rounded-lg ${
            isSelected ? 'bg-blue-100 border-l-4 border-blue-500' : ''
          }`}
          style={{ 
            paddingLeft: `${paddingLeft}px`,
            backgroundColor: isSelected ? '#dbeafe' : (isExpanded ? '#f9fafb' : 'transparent')
          }}
          onMouseEnter={(e) => !isSelected && (e.target.style.backgroundColor = '#f3f4f6')}
          onMouseLeave={(e) => !isSelected && (e.target.style.backgroundColor = isSelected ? '#dbeafe' : (isExpanded ? '#f9fafb' : 'transparent'))}
          onClick={(e) => {
            e.stopPropagation();
            if (e.detail === 1) { // Одинарный клик - выбор
              selectNode(group, 'group');
            }
            if (hasChildren && e.detail === 2) { // Двойной клик - разворот
              toggleNode(group.id);
            }
          }}
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
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(group.id);
              }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          ) : (
            <div style={{ width: '12px', height: '12px', marginRight: '8px' }} />
          )}
          
          {/* Иконка группы - папка */}
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
            {/* Сначала отображаем дочерние группы */}
            {group.children && group.children.map(child => renderTreeItem(child, level + 1))}
            
            {/* Затем отображаем компоненты */}
            {group.components && group.components.map(component => renderComponent(component, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Структура DD</h3>
      </div>
      
      <div className="flex h-96">
        {/* Левая половина - дерево */}
        <div style={{ flexBasis: '50%' }} className="p-4 border-r overflow-y-auto overflow-x-auto">
          <div>
            {hierarchicalGroups.map(group => renderTreeItem(group))}
          </div>
        </div>
        
        {/* Правая половина - детали выбранного узла */}
        <div style={{ flexBasis: '50%' }} className="p-4 overflow-y-auto">
          <NodeDetailsCard selectedNode={selectedNode} />
        </div>
      </div>
    </div>
  );
} 
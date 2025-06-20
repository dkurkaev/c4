'use client';

import { useState, useEffect } from 'react';
import NodeDetailsCard from '../../components/NodeDetailsCard';

interface DDGroupAPI {
  id: number;
  parent_id: number | null;
  name: string;
  type_id: number;
  type_name: string;
  instances: number | null;
  specification: string;
}

interface DDComponentAPI {
  id: number;
  name: string;
  c2_component_id: number | null;
  type_id: number;
  type_name: string;
  technology: string;
  description: string;
  group_id: number;
  is_external: boolean;
}

interface ComponentType {
  id: number;
  name: string;
}

interface DdGroupType {
  id: number;
  name: string;
}

interface DDTreeNode {
  id: string;
  name: string;
  type: 'group' | 'component';
  children?: DDTreeNode[];
  data?: DDGroupAPI | DDComponentAPI;
}

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

// Функция для построения дерева из плоского списка групп и компонентов
function buildTree(groups: DDGroupAPI[], components: DDComponentAPI[]): DDTreeNode[] {
  const groupMap = new Map<number, DDTreeNode>();
  const roots: DDTreeNode[] = [];

  // Создаем узлы для групп
  groups.forEach(group => {
    groupMap.set(group.id, {
      id: `group-${group.id}`,
      name: group.name,
      type: 'group',
      children: [],
      data: group // Сохраняем данные группы
    });
  });

  // Строим иерархию групп
  groups.forEach(group => {
    const node = groupMap.get(group.id)!;
    
    if (group.parent_id === null) {
      // Корневой элемент
      roots.push(node);
    } else {
      // Дочерний элемент
      const parent = groupMap.get(group.parent_id);
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(node);
      }
    }
  });

  // Добавляем компоненты к соответствующим группам
  components.forEach(component => {
    const parentGroup = groupMap.get(component.group_id);
    if (parentGroup) {
      if (!parentGroup.children) {
        parentGroup.children = [];
      }
      parentGroup.children.push({
        id: `component-${component.id}`,
        name: component.name,
        type: 'component',
        data: component // Сохраняем данные компонента
      });
    }
  });

  return roots;
}

function TreeNode({ node, level, onNodeSelect, onContextMenu, onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd, isDragOver, isDragging }: TreeNodeProps) {
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
}

export default function DDPage() {
  const [ddTree, setDdTree] = useState<DDTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<DDTreeNode | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [componentTypes, setComponentTypes] = useState<ComponentType[]>([]);
  const [ddGroupTypes, setDdGroupTypes] = useState<DdGroupType[]>([]);
  
  // Состояние для контекстного меню
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    node: DDTreeNode | null;
  }>({ visible: false, x: 0, y: 0, node: null });
  
  // Состояние для модального окна создания
  const [createModal, setCreateModal] = useState<{
    visible: boolean;
    parentNode: DDTreeNode | null;
    createType: 'group' | 'component' | null;
    isEditing: boolean;
    editValues: any;
  }>({ visible: false, parentNode: null, createType: null, isEditing: false, editValues: {} });

  // Состояние для drag'n'drop
  const [dragState, setDragState] = useState<{
    draggedNode: DDTreeNode | null;
    dragOverNode: DDTreeNode | null;
    isDragging: boolean;
  }>({ draggedNode: null, dragOverNode: null, isDragging: false });

  // Состояние для модального окна подтверждения перемещения
  const [moveConfirmModal, setMoveConfirmModal] = useState<{
    visible: boolean;
    sourceNode: DDTreeNode | null;
    targetNode: DDTreeNode | null;
  }>({ visible: false, sourceNode: null, targetNode: null });

  const handleNodeSelect = (node: DDTreeNode) => {
    setSelectedNode(node);
    setIsEditing(false);
    setEditValues({});
    setContextMenu({ visible: false, x: 0, y: 0, node: null });
  };

  const handleContextMenu = (e: React.MouseEvent, node: DDTreeNode) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      node: node
    });
  };

  const handleCreateNew = () => {
    setCreateModal({
      visible: true,
      parentNode: contextMenu.node,
      createType: null,
      isEditing: false,
      editValues: {}
    });
    setContextMenu({ visible: false, x: 0, y: 0, node: null });
  };

  const handleCreateTypeSelect = (type: 'group' | 'component') => {
    const defaultValues = type === 'group' 
      ? { name: '', instances: null, specification: '', type_id: '' }
      : { name: '', technology: '', description: '', is_external: false, type_id: '', group_id: '' };
    
    setCreateModal({
      ...createModal,
      createType: type,
      isEditing: true,
      editValues: defaultValues
    });
  };

  const handleCreateCancel = () => {
    setCreateModal({ visible: false, parentNode: null, createType: null, isEditing: false, editValues: {} });
  };

  const handleCreateSave = async () => {
    if (!createModal.createType || !createModal.editValues) return;

    try {
      setSaving(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      let endpoint = '';
      let payload = { ...createModal.editValues };
      
      if (createModal.createType === 'group') {
        endpoint = `${apiUrl}/api/architecture/dd-groups`;
        // Для группы добавляем parent_id если есть родитель
        if (createModal.parentNode && createModal.parentNode.type === 'group') {
          const parentId = (createModal.parentNode.data as DDGroupAPI).id;
          payload.parent_id = parentId;
        }
      } else {
        endpoint = `${apiUrl}/api/architecture/dd-components`;
        // Для компонента добавляем group_id
        if (createModal.parentNode && createModal.parentNode.type === 'group') {
          const groupId = (createModal.parentNode.data as DDGroupAPI).id;
          payload.group_id = groupId;
        }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Перезагружаем данные после создания
      const fetchDDData = async () => {
        const [groupsResponse, componentsResponse] = await Promise.all([
          fetch(`${apiUrl}/api/architecture/dd-groups`),
          fetch(`${apiUrl}/api/architecture/dd-components`)
        ]);
        
        const [groupsData, componentsData]: [DDGroupAPI[], DDComponentAPI[]] = await Promise.all([
          groupsResponse.json(),
          componentsResponse.json()
        ]);
        
        const treeData = buildTree(groupsData, componentsData);
        setDdTree(treeData);
      };

      await fetchDDData();
      handleCreateCancel();
    } catch (err) {
      console.error('Ошибка создания:', err);
      alert('Ошибка при создании элемента');
    } finally {
      setSaving(false);
    }
  };

  // Проверка возможности удаления элемента
  const canDeleteNode = (node: DDTreeNode): boolean => {
    return !node.children || node.children.length === 0;
  };

  // Обработчик удаления элемента
  const handleDelete = async () => {
    if (!contextMenu.node) return;

    const node = contextMenu.node;
    
    // Проверяем, можно ли удалить элемент
    if (!canDeleteNode(node)) {
      alert('Невозможно удалить элемент, который содержит дочерние элементы. Сначала удалите или переместите все дочерние элементы.');
      setContextMenu({ visible: false, x: 0, y: 0, node: null });
      return;
    }

    // Подтверждение удаления
    const confirmDelete = window.confirm(`Вы уверены, что хотите удалить "${node.name}"?`);
    if (!confirmDelete) {
      setContextMenu({ visible: false, x: 0, y: 0, node: null });
      return;
    }

    try {
      setSaving(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      let endpoint = '';
      
      if (node.type === 'group') {
        const groupId = (node.data as DDGroupAPI).id;
        endpoint = `${apiUrl}/api/architecture/dd-groups/${groupId}`;
      } else {
        const componentId = (node.data as DDComponentAPI).id;
        endpoint = `${apiUrl}/api/architecture/dd-components/${componentId}`;
      }

      const response = await fetch(endpoint, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Перезагружаем данные после удаления
      const fetchDDData = async () => {
        const [groupsResponse, componentsResponse] = await Promise.all([
          fetch(`${apiUrl}/api/architecture/dd-groups`),
          fetch(`${apiUrl}/api/architecture/dd-components`)
        ]);
        
        const [groupsData, componentsData]: [DDGroupAPI[], DDComponentAPI[]] = await Promise.all([
          groupsResponse.json(),
          componentsResponse.json()
        ]);
        
        const treeData = buildTree(groupsData, componentsData);
        setDdTree(treeData);
      };

      await fetchDDData();
      
      // Если удаленный элемент был выбран, сбрасываем выбор
      if (selectedNode && selectedNode.id === node.id) {
        setSelectedNode(null);
        setIsEditing(false);
        setEditValues({});
      }
      
      setContextMenu({ visible: false, x: 0, y: 0, node: null });
    } catch (err) {
      console.error('Ошибка удаления:', err);
      alert('Ошибка при удалении элемента');
    } finally {
      setSaving(false);
    }
  };

  // Закрытие контекстного меню при клике вне его
  const handleDocumentClick = () => {
    setContextMenu({ visible: false, x: 0, y: 0, node: null });
  };

  const handleEditStart = () => {
    if (selectedNode && selectedNode.data) {
      setIsEditing(true);
      setEditValues({ ...selectedNode.data });
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditValues({});
  };

  const handleEditSave = async () => {
    if (!selectedNode || !selectedNode.data) return;

    try {
      setSaving(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      let endpoint = '';
      let method = 'PUT';
      
      if (selectedNode.type === 'group') {
        const groupId = (selectedNode.data as DDGroupAPI).id;
        endpoint = `${apiUrl}/api/architecture/dd-groups/${groupId}`;
      } else {
        const componentId = (selectedNode.data as DDComponentAPI).id;
        endpoint = `${apiUrl}/api/architecture/dd-components/${componentId}`;
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editValues),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedData = await response.json();

      // Создаем новый объект данных с обновленными значениями
      const newData = { ...selectedNode.data, ...updatedData };
      
      // Если это группа, обновляем type_name из справочника
      if (selectedNode.type === 'group' && editValues.type_id) {
        const groupType = ddGroupTypes.find(type => type.id === editValues.type_id);
        if (groupType) {
          (newData as DDGroupAPI).type_name = groupType.name;
        }
      }
      
      // Если это компонент, обновляем type_name из справочника
      if (selectedNode.type === 'component' && editValues.type_id) {
        const componentType = componentTypes.find(type => type.id === editValues.type_id);
        if (componentType) {
          (newData as DDComponentAPI).type_name = componentType.name;
        }
      }

      // Создаем новый узел с обновленными данными
      const newSelectedNode = {
        ...selectedNode,
        name: newData.name, // Обновляем название в узле дерева
        data: newData
      };

      // Функция для рекурсивного обновления дерева
      const updateTreeNode = (nodes: DDTreeNode[]): DDTreeNode[] => {
        return nodes.map(node => {
          if (node.id === selectedNode.id) {
            return newSelectedNode;
          }
          if (node.children) {
            return {
              ...node,
              children: updateTreeNode(node.children)
            };
          }
          return node;
        });
      };

      // Обновляем дерево
      setDdTree(prevTree => updateTreeNode(prevTree));
      
      // Обновляем выбранный узел
      setSelectedNode(newSelectedNode);

      setIsEditing(false);
      setEditValues({});
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      alert('Ошибка при сохранении изменений');
    } finally {
      setSaving(false);
    }
  };

  const renderNodeDetails = (node: DDTreeNode | null, nodeData: any, isEditingMode: boolean, editVals: any, onValueChange: (values: any) => void) => {
    if (!node || !nodeData) {
      return (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>Компонент не выбран</p>
        </div>
      );
    }

    if (node.type === 'group') {
      const group = nodeData as DDGroupAPI;
      return (
        <div className="space-y-4">
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Название</label>
              {isEditingMode ? (
                <input
                  type="text"
                  value={editVals.name || ''}
                  onChange={(e) => onValueChange({ ...editVals, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 rounded-md px-3 py-2">{group.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Экземпляры</label>
              {isEditingMode ? (
                <input
                  type="number"
                  value={editVals.instances || ''}
                  onChange={(e) => onValueChange({ ...editVals, instances: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                  {group.instances !== null ? group.instances : 'Не указано'}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Спецификация</label>
              {isEditingMode ? (
                <textarea
                  value={editVals.specification || ''}
                  onChange={(e) => onValueChange({ ...editVals, specification: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                  {group.specification || 'Не указана'}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Тип</label>
              {isEditingMode ? (
                <select
                  value={editVals.type_id || ''}
                  onChange={(e) => onValueChange({ ...editVals, type_id: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите тип</option>
                  {ddGroupTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-900 bg-gray-50 rounded-md px-3 py-2">{group.type_name}</p>
              )}
            </div>
          </div>
        </div>
      );
    } else {
      const component = nodeData as DDComponentAPI;
      return (
        <div className="space-y-4">
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Название</label>
              {isEditingMode ? (
                <input
                  type="text"
                  value={editVals.name || ''}
                  onChange={(e) => onValueChange({ ...editVals, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 rounded-md px-3 py-2">{component.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Технология</label>
              {isEditingMode ? (
                <input
                  type="text"
                  value={editVals.technology || ''}
                  onChange={(e) => onValueChange({ ...editVals, technology: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                  {component.technology || 'Не указана'}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Описание</label>
              {isEditingMode ? (
                <textarea
                  value={editVals.description || ''}
                  onChange={(e) => onValueChange({ ...editVals, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                  {component.description || 'Не указано'}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Внешний компонент</label>
              {isEditingMode ? (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editVals.is_external || false}
                    onChange={(e) => onValueChange({ ...editVals, is_external: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Внешний компонент</span>
                </div>
              ) : (
                <p className="text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                  {component.is_external ? 'Да' : 'Нет'}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Тип</label>
              {isEditingMode ? (
                <select
                  value={editVals.type_id || ''}
                  onChange={(e) => onValueChange({ ...editVals, type_id: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите тип</option>
                  {componentTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-900 bg-gray-50 rounded-md px-3 py-2">{component.type_name}</p>
              )}
            </div>
          </div>
        </div>
      );
    }
  };

  // Проверка возможности перемещения элемента
  const canMoveNode = (sourceNode: DDTreeNode, targetNode: DDTreeNode): boolean => {
    // Нельзя перемещать элемент сам в себя
    if (sourceNode.id === targetNode.id) return false;
    
    // Нельзя перемещать группу в компонент
    if (sourceNode.type === 'group' && targetNode.type === 'component') return false;
    
    // Нельзя перемещать элемент в своего потомка (избегаем циклических ссылок)
    // Проверяем только потомков sourceNode, а не предков
    const isDescendant = (node: DDTreeNode, ancestorId: string): boolean => {
      if (node.children) {
        return node.children.some(child => 
          child.id === ancestorId || isDescendant(child, ancestorId)
        );
      }
      return false;
    };
    
    // Запрещаем перемещение только в потомков, предков разрешаем
    return !isDescendant(sourceNode, targetNode.id);
  };

  // Обработчики drag'n'drop
  const handleDragStart = (e: React.DragEvent, node: DDTreeNode) => {
    setDragState({ draggedNode: node, dragOverNode: null, isDragging: true });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, node: DDTreeNode) => {
    e.preventDefault();
    if (dragState.draggedNode && canMoveNode(dragState.draggedNode, node)) {
      e.dataTransfer.dropEffect = 'move';
      setDragState(prev => ({ ...prev, dragOverNode: node }));
    } else {
      e.dataTransfer.dropEffect = 'none';
      setDragState(prev => ({ ...prev, dragOverNode: null }));
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragState(prev => ({ ...prev, dragOverNode: null }));
  };

  const handleDrop = (e: React.DragEvent, targetNode: DDTreeNode) => {
    e.preventDefault();
    
    if (!dragState.draggedNode || !canMoveNode(dragState.draggedNode, targetNode)) {
      setDragState({ draggedNode: null, dragOverNode: null, isDragging: false });
      return;
    }

    // Показываем модальное окно подтверждения
    setMoveConfirmModal({
      visible: true,
      sourceNode: dragState.draggedNode,
      targetNode: targetNode
    });

    setDragState({ draggedNode: null, dragOverNode: null, isDragging: false });
  };

  const handleDragEnd = () => {
    setDragState({ draggedNode: null, dragOverNode: null, isDragging: false });
  };

  // Обработчик подтверждения перемещения
  const handleMoveConfirm = async () => {
    if (!moveConfirmModal.sourceNode || !moveConfirmModal.targetNode) return;

    const sourceNode = moveConfirmModal.sourceNode;
    const targetNode = moveConfirmModal.targetNode;

    try {
      setSaving(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      let endpoint = '';
      let payload: any = {};
      
      if (sourceNode.type === 'group') {
        const groupId = (sourceNode.data as DDGroupAPI).id;
        endpoint = `${apiUrl}/api/architecture/dd-groups/${groupId}`;
        
        // Устанавливаем новый parent_id
        payload = {
          ...sourceNode.data,
          parent_id: targetNode.type === 'group' ? (targetNode.data as DDGroupAPI).id : null
        };
      } else {
        const componentId = (sourceNode.data as DDComponentAPI).id;
        endpoint = `${apiUrl}/api/architecture/dd-components/${componentId}`;
        
        // Устанавливаем новый group_id
        payload = {
          ...sourceNode.data,
          group_id: targetNode.type === 'group' ? (targetNode.data as DDGroupAPI).id : (targetNode.data as DDComponentAPI).group_id
        };
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Перезагружаем данные после перемещения
      const fetchDDData = async () => {
        const [groupsResponse, componentsResponse] = await Promise.all([
          fetch(`${apiUrl}/api/architecture/dd-groups`),
          fetch(`${apiUrl}/api/architecture/dd-components`)
        ]);
        
        const [groupsData, componentsData]: [DDGroupAPI[], DDComponentAPI[]] = await Promise.all([
          groupsResponse.json(),
          componentsResponse.json()
        ]);
        
        const treeData = buildTree(groupsData, componentsData);
        setDdTree(treeData);
      };

      await fetchDDData();
      setMoveConfirmModal({ visible: false, sourceNode: null, targetNode: null });
    } catch (err) {
      console.error('Ошибка перемещения:', err);
      alert('Ошибка при перемещении элемента');
    } finally {
      setSaving(false);
    }
  };

  const handleMoveCancel = () => {
    setMoveConfirmModal({ visible: false, sourceNode: null, targetNode: null });
  };

  // Обработчик экспорта
  const handleExport = async () => {
    if (!contextMenu.node) return;

    const node = contextMenu.node;
    
    // Экспорт доступен только для групп
    if (node.type !== 'group') {
      alert('Экспорт доступен только для групп');
      setContextMenu({ visible: false, x: 0, y: 0, node: null });
      return;
    }

    try {
      setSaving(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const groupId = (node.data as DDGroupAPI).id;
      const endpoint = `${apiUrl}/api/architecture/dd-groups/export/drawio?root_group_id=${groupId}`;

      const response = await fetch(endpoint, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Получаем данные как blob для скачивания файла
      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      
      // Извлекаем имя файла из заголовка или создаем по умолчанию
      let filename = `dd-export-${node.name}.drawio`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      // Создаем ссылку для скачивания
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Очищаем ресурсы
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setContextMenu({ visible: false, x: 0, y: 0, node: null });
    } catch (err) {
      console.error('Ошибка экспорта:', err);
      alert('Ошибка при экспорте диаграммы');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const fetchDDData = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        
        // Параллельно загружаем группы, компоненты и справочники
        const [groupsResponse, componentsResponse, componentTypesResponse, ddGroupTypesResponse] = await Promise.all([
          fetch(`${apiUrl}/api/architecture/dd-groups`),
          fetch(`${apiUrl}/api/architecture/dd-components`),
          fetch(`${apiUrl}/api/architecture/component-types`),
          fetch(`${apiUrl}/api/architecture/dd-group-types`)
        ]);
        
        if (!groupsResponse.ok || !componentsResponse.ok || !componentTypesResponse.ok || !ddGroupTypesResponse.ok) {
          throw new Error(`HTTP error! Groups: ${groupsResponse.status}, Components: ${componentsResponse.status}, ComponentTypes: ${componentTypesResponse.status}, DdGroupTypes: ${ddGroupTypesResponse.status}`);
        }
        
        const [groupsData, componentsData, componentTypesData, ddGroupTypesData]: [DDGroupAPI[], DDComponentAPI[], ComponentType[], DdGroupType[]] = await Promise.all([
          groupsResponse.json(),
          componentsResponse.json(),
          componentTypesResponse.json(),
          ddGroupTypesResponse.json()
        ]);
        
        const treeData = buildTree(groupsData, componentsData);
        setDdTree(treeData);
        setComponentTypes(componentTypesData);
        setDdGroupTypes(ddGroupTypesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
        console.error('Ошибка загрузки DD данных:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDDData();
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">DD - Deployment Diagram</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Загрузка компонентов...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">DD - Deployment Diagram</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700 font-medium">Ошибка загрузки данных</span>
          </div>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">DD - Deployment Diagram</h1>
      
      <div className="flex gap-6">
        {/* Левая часть - дерево компонентов */}
        <div className="w-1/2">
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
                      onNodeSelect={handleNodeSelect} 
                      onContextMenu={handleContextMenu} 
                      onDragStart={handleDragStart} 
                      onDragOver={handleDragOver} 
                      onDragLeave={handleDragLeave} 
                      onDrop={handleDrop} 
                      onDragEnd={handleDragEnd} 
                      isDragOver={dragState.dragOverNode?.id === node.id} 
                      isDragging={dragState.draggedNode?.id === node.id} 
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Правая часть - карточка компонента */}
        <div className="w-1/2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Детали компонента</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedNode ? 'Информация о выбранном элементе' : 'Выберите компонент для просмотра деталей'}
                </p>
              </div>
              
              {selectedNode && !isEditing && (
                <button
                  onClick={handleEditStart}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Изменить
                </button>
              )}
              
              {selectedNode && isEditing && (
                <div className="flex gap-2">
                  <button
                    onClick={handleEditCancel}
                    disabled={saving}
                    className="flex items-center px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Отмена
                  </button>
                  <button
                    onClick={handleEditSave}
                    disabled={saving}
                    className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    ОК
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <NodeDetailsCard 
                node={selectedNode} 
                nodeData={selectedNode?.data} 
                isEditingMode={isEditing} 
                editValues={editValues} 
                onValueChange={setEditValues}
                componentTypes={componentTypes}
                ddGroupTypes={ddGroupTypes}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Контекстное меню */}
      {contextMenu.visible && (
        <div 
          className="fixed bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={handleCreateNew}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Создать новый элемент
          </button>
          
          <button
            onClick={handleExport}
            disabled={contextMenu.node?.type !== 'group' || saving}
            className={`w-full text-left px-4 py-2 flex items-center ${
              contextMenu.node?.type === 'group' && !saving
                ? 'hover:bg-gray-100 text-gray-700' 
                : 'text-gray-400 cursor-not-allowed'
            }`}
            title={
              contextMenu.node?.type !== 'group' 
                ? 'Экспорт доступен только для групп' 
                : 'Экспортировать в draw.io'
            }
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
            onClick={handleDelete}
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
      )}
      
      {/* Модальное окно создания */}
      {createModal.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Создание нового элемента</h2>
              <p className="text-sm text-gray-600 mt-1">
                {createModal.parentNode 
                  ? `Родительский элемент: ${createModal.parentNode.name}`
                  : 'Создание корневого элемента'
                }
              </p>
            </div>
            
            <div className="p-6">
              {!createModal.createType ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-800">Выберите тип элемента:</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleCreateTypeSelect('group')}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <svg className="w-8 h-8 mx-auto mb-2 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="3" width="18" height="18" strokeWidth={2} strokeDasharray="4 2" rx="2" />
                      </svg>
                      <div className="text-center">
                        <div className="font-medium">Группа</div>
                        <div className="text-sm text-gray-600">Создать новую группу развертывания</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => handleCreateTypeSelect('component')}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <svg className="w-8 h-8 mx-auto mb-2" fill="#23A2D9" stroke="#23A2D9" viewBox="0 0 24 24">
                        <rect x="3" y="3" width="18" height="18" strokeWidth={2} rx="4" />
                      </svg>
                      <div className="text-center">
                        <div className="font-medium">Компонент</div>
                        <div className="text-sm text-gray-600">Создать новый компонент развертывания</div>
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      Создание {createModal.createType === 'group' ? 'группы' : 'компонента'}
                    </h3>
                  </div>
                  
                  <div className="p-4 border-t">
                    <h3 className="text-lg font-medium mb-4">Детали компонента</h3>
                    <NodeDetailsCard 
                      node={createModal.parentNode} 
                      nodeData={createModal.editValues} 
                      isEditingMode={true} 
                      editValues={createModal.editValues} 
                      onValueChange={(values) => setCreateModal(prev => ({ ...prev, editValues: values }))}
                      componentTypes={componentTypes}
                      ddGroupTypes={ddGroupTypes}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={handleCreateCancel}
                disabled={saving}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Отмена
              </button>
              
              {createModal.createType && (
                <button
                  onClick={handleCreateSave}
                  disabled={saving || !createModal.editValues.name}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Создание...
                    </div>
                  ) : (
                    'Создать'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Модальное окно подтверждения перемещения */}
      {moveConfirmModal.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Подтверждение перемещения</h2>
              <p className="text-sm text-gray-600 mt-1">
                Вы уверены, что хотите переместить "{moveConfirmModal.sourceNode?.name}" в "{moveConfirmModal.targetNode?.name}"?
              </p>
            </div>
            
            <div className="p-6 flex justify-end gap-3">
              <button
                onClick={handleMoveCancel}
                disabled={saving}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Отмена
              </button>
              
              <button
                onClick={handleMoveConfirm}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Перемещение...
                  </div>
                ) : (
                  'Переместить'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
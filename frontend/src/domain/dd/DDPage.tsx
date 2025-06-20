'use client';

import { useState, useEffect } from 'react';

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

function TreeNode({ node, level, onNodeSelect }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="select-none">
      <div 
        className={`flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer rounded-md transition-colors`}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
        onClick={(e) => {
          e.stopPropagation();
          if (hasChildren) {
            setIsExpanded(!isExpanded);
          }
          onNodeSelect(node);
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
      </div>
      
      {hasChildren && isExpanded && (
        <div className="ml-2">
          {node.children!.map((child) => (
            <TreeNode key={child.id} node={child} level={level + 1} onNodeSelect={onNodeSelect} />
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

  const handleNodeSelect = (node: DDTreeNode) => {
    setSelectedNode(node);
    setIsEditing(false);
    setEditValues({});
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

  const renderNodeDetails = () => {
    if (!selectedNode || !selectedNode.data) {
      return (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>Компонент не выбран</p>
        </div>
      );
    }

    if (selectedNode.type === 'group') {
      const group = selectedNode.data as DDGroupAPI;
      return (
        <div className="space-y-4">
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Название</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editValues.name || ''}
                  onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 rounded-md px-3 py-2">{group.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Экземпляры</label>
              {isEditing ? (
                <input
                  type="number"
                  value={editValues.instances || ''}
                  onChange={(e) => setEditValues({ ...editValues, instances: e.target.value ? parseInt(e.target.value) : null })}
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
              {isEditing ? (
                <textarea
                  value={editValues.specification || ''}
                  onChange={(e) => setEditValues({ ...editValues, specification: e.target.value })}
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
              {isEditing ? (
                <select
                  value={editValues.type_id || ''}
                  onChange={(e) => setEditValues({ ...editValues, type_id: parseInt(e.target.value) })}
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
      const component = selectedNode.data as DDComponentAPI;
      return (
        <div className="space-y-4">
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Название</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editValues.name || ''}
                  onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 rounded-md px-3 py-2">{component.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Технология</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editValues.technology || ''}
                  onChange={(e) => setEditValues({ ...editValues, technology: e.target.value })}
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
              {isEditing ? (
                <textarea
                  value={editValues.description || ''}
                  onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
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
              {isEditing ? (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editValues.is_external || false}
                    onChange={(e) => setEditValues({ ...editValues, is_external: e.target.checked })}
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
              {isEditing ? (
                <select
                  value={editValues.type_id || ''}
                  onChange={(e) => setEditValues({ ...editValues, type_id: parseInt(e.target.value) })}
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
                    <TreeNode key={node.id} node={node} level={0} onNodeSelect={handleNodeSelect} />
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
              {renderNodeDetails()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
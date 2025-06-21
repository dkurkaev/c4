'use client';

import { useState, useEffect } from 'react';
import NodeDetailsCard from '../../components/NodeDetailsCard';
import { DDTree, CreateModal, MoveConfirmModal, DeleteConfirmModal } from './components';
import { 
  DDGroupAPI, 
  DDComponentAPI, 
  ComponentType, 
  DdGroupType, 
  DDLink, 
  DDTreeNode,
  DragState,
  ContextMenuState,
  CreateModalState,
  MoveConfirmModalState,
  DeleteConfirmModalState
} from './types';

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

export default function DDPage() {
  const [ddTree, setDdTree] = useState<DDTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<DDTreeNode | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<any>({});
  const [saving, setSaving] = useState(false);
  
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

  // Состояние для модального окна подтверждения удаления
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    visible: boolean;
    node: DDTreeNode | null;
  }>({ visible: false, node: null });

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

    // Показываем модальное окно подтверждения
    setDeleteConfirmModal({
      visible: true,
      node: node
    });
    setContextMenu({ visible: false, x: 0, y: 0, node: null });
  };

  // Закрытие контекстного меню при клике вне его
  const handleDocumentClick = () => {
    setContextMenu({ visible: false, x: 0, y: 0, node: null });
  };

  const handleEditStart = async () => {
    if (selectedNode && selectedNode.data) {
      setIsEditing(true);
      const initialValues: any = { ...selectedNode.data };
      
      // Если это группа, загружаем связи
      if (selectedNode.type === 'group') {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          const groupId = (selectedNode.data as DDGroupAPI).id;
          const response = await fetch(`${apiUrl}/api/architecture/dd-groups/${groupId}/links`);
          if (response.ok) {
            const linksData = await response.json();
            initialValues.links = linksData.map((link: any) => ({
              id: link.id,
              group_from_id: link.group_from_id,
              group_to_id: link.group_to_id,
              protocol_id: link.protocol_id,
              ports: [...link.ports]
            }));
          } else {
            initialValues.links = [];
          }
        } catch (error) {
          console.error('Ошибка загрузки связей:', error);
          initialValues.links = [];
        }
      }
      
      setEditValues(initialValues);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditValues({});
  };

  const handleEditSave = async () => {
    if (!selectedNode || !editValues) return;

    try {
      setSaving(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      let endpoint = '';
      let updatedData = { ...editValues };
      
      if (selectedNode.type === 'group') {
        const groupId = (selectedNode.data as DDGroupAPI).id;
        endpoint = `${apiUrl}/api/architecture/dd-groups/${groupId}`;
      } else {
        const componentId = (selectedNode.data as DDComponentAPI).id;
        endpoint = `${apiUrl}/api/architecture/dd-components/${componentId}`;
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Создаем новый объект данных с обновленными значениями
      const newData = { ...selectedNode.data, ...updatedData };

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

    try {
      setSaving(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const endpoint = `${apiUrl}/api/architecture/export`;

      // Определяем тип элемента и его ID
      let elementType: string;
      let elementId: number;

      if (node.type === 'group') {
        elementType = 'ddgroup';
        elementId = (node.data as DDGroupAPI).id;
      } else {
        elementType = 'ddcomponent';
        elementId = (node.data as DDComponentAPI).id;
      }

      // Подготавливаем тело запроса
      const payload = {
        element_id: elementId,
        element_type: elementType
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Пытаемся получить сообщение об ошибке из ответа
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      // Получаем данные как blob для скачивания файла
      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      
      // Извлекаем имя файла из заголовка или создаем по умолчанию
      let filename = `${elementType}_${elementId}.drawio`;
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
      alert(`Ошибка при экспорте диаграммы: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
    } finally {
      setSaving(false);
    }
  };

  // Обработчик подтверждения удаления
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmModal.node) return;

    const node = deleteConfirmModal.node;

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
      
      setDeleteConfirmModal({ visible: false, node: null });
    } catch (err) {
      console.error('Ошибка удаления:', err);
      alert('Ошибка при удалении элемента');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmModal({ visible: false, node: null });
  };

  useEffect(() => {
    const fetchDDData = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        
        // Загружаем только группы и компоненты
        const [groupsResponse, componentsResponse] = await Promise.all([
          fetch(`${apiUrl}/api/architecture/dd-groups`),
          fetch(`${apiUrl}/api/architecture/dd-components`)
        ]);
        
        if (!groupsResponse.ok || !componentsResponse.ok) {
          throw new Error(`HTTP error! Groups: ${groupsResponse.status}, Components: ${componentsResponse.status}`);
        }
        
        const [groupsData, componentsData]: [DDGroupAPI[], DDComponentAPI[]] = await Promise.all([
          groupsResponse.json(),
          componentsResponse.json()
        ]);
        
        const treeData = buildTree(groupsData, componentsData);
        setDdTree(treeData);
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
          <DDTree
            ddTree={ddTree}
            dragState={dragState}
            contextMenu={contextMenu}
            saving={saving}
            onNodeSelect={handleNodeSelect}
            onContextMenu={handleContextMenu}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            onCreateNew={handleCreateNew}
            onExport={handleExport}
            onDelete={handleDelete}
            canDeleteNode={canDeleteNode}
          />
        </div>
        
        {/* Правая часть - карточка компонента */}
        <div className="w-1/2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4">
              <NodeDetailsCard 
                node={selectedNode} 
                nodeData={selectedNode?.data} 
                isEditingMode={isEditing} 
                editValues={editValues} 
                onValueChange={setEditValues}
                onEditStart={handleEditStart}
                onEditSave={handleEditSave}
                onEditCancel={handleEditCancel}
                saving={saving}
              />
            </div>
          </div>
        </div>
      </div>
      
      <CreateModal
        createModal={createModal}
        saving={saving}
        onTypeSelect={handleCreateTypeSelect}
        onValueChange={(values) => setCreateModal(prev => ({ ...prev, editValues: values }))}
        onCancel={handleCreateCancel}
        onSave={handleCreateSave}
      />
      
      <MoveConfirmModal
        moveConfirmModal={moveConfirmModal}
        saving={saving}
        onConfirm={handleMoveConfirm}
        onCancel={handleMoveCancel}
      />
      
      <DeleteConfirmModal
        deleteConfirmModal={deleteConfirmModal}
        saving={saving}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
} 
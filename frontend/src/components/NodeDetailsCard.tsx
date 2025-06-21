import React, { useEffect, useState } from 'react';

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

interface DDLink {
  id: number;
  group_from_id: number;
  group_to_id: number;
  protocol_id: number;
  protocol_name: string;
  ports: number[];
}

interface DDTreeNode {
  id: string;
  name: string;
  type: 'group' | 'component';
  children?: DDTreeNode[];
  data?: DDGroupAPI | DDComponentAPI;
}

interface NodeDetailsCardProps {
  node: DDTreeNode | null;
  nodeData: DDGroupAPI | DDComponentAPI | undefined;
  isEditingMode: boolean;
  editValues: any;
  onValueChange: (values: any) => void;
  onSaveLinks?: (groupId: number, links: any[]) => Promise<void>;
  onEditStart?: () => void;
  onEditSave?: () => Promise<void>;
  onEditCancel?: () => void;
  saving?: boolean;
  hideHeaderAndButtons?: boolean;
}

// Компонент для выбора группы с деревом и поиском
const GroupSelector: React.FC<{
  value: number | null | undefined;
  onChange: (groupId: number) => void;
  groups: DDGroupAPI[];
  excludeGroupId?: number | null;
}> = ({ value, onChange, groups, excludeGroupId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Фильтруем группы по поисковому запросу
  const filteredGroups = groups.filter(group => {
    if (group.id === excludeGroupId) return false;
    
    const groupName = group.name.toLowerCase().trim();
    const search = searchTerm.toLowerCase().trim();
    
    if (!search) return true; // Показываем все группы если поиск пустой
    
    // Простой поиск по вхождению подстроки
    return groupName.includes(search);
  });

  // Функция для построения полного пути к группе
  const getGroupPath = (group: DDGroupAPI): string[] => {
    const path: string[] = [];
    let currentGroup: DDGroupAPI | undefined = group;
    
    while (currentGroup) {
      path.unshift(currentGroup.name);
      currentGroup = groups.find(g => g.id === currentGroup!.parent_id);
    }
    
    return path;
  };

  const selectedGroup = groups.find(g => g.id === value);

  // Компонент для отображения элемента в плоском списке с полным путем
  const FlatListItem: React.FC<{ group: DDGroupAPI }> = ({ group }) => {
    const path = getGroupPath(group);
    const groupName = path[path.length - 1];
    const pathWithoutLast = path.slice(0, -1);

    return (
      <div
        className={`flex items-center px-3 py-2 cursor-pointer hover:bg-blue-50 ${
          value === group.id ? 'bg-blue-100' : ''
        }`}
        onClick={() => {
          onChange(group.id);
          setIsOpen(false);
          setSearchTerm('');
        }}
      >
        <div className="flex-1 min-w-0">
          {pathWithoutLast.length > 0 && (
            <div className="text-xs text-gray-500 truncate">
              {pathWithoutLast.join(' → ')} →
            </div>
          )}
          <div className="flex items-center">
            <span className="text-gray-900 font-medium">{groupName}</span>
            <span className="ml-2 text-xs text-gray-500">({group.type_name})</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      <div
        className="w-full px-2 py-1 border border-gray-300 rounded text-xs cursor-pointer bg-white flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedGroup ? 'text-gray-900' : 'text-gray-500'}>
          {selectedGroup ? selectedGroup.name : 'Выберите группу'}
        </span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {isOpen && (
        <div className="absolute z-[9999] w-96 mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-64 overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Поиск группы..."
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredGroups.length > 0 ? (
              filteredGroups.map(group => (
                <FlatListItem key={group.id} group={group} />
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500 text-xs">Группы не найдены</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Компонент для отображения портов в виде тэгов
const PortTags: React.FC<{
  ports: number[];
  isEditing: boolean;
  onChange: (ports: number[]) => void;
}> = ({ ports, isEditing, onChange }) => {
  const [newPort, setNewPort] = useState('');

  const addPort = () => {
    const port = parseInt(newPort.trim());
    if (!isNaN(port) && port > 0 && port <= 65535 && !ports.includes(port)) {
      onChange([...ports, port]);
      setNewPort('');
    }
  };

  const removePort = (portToRemove: number) => {
    onChange(ports.filter(port => port !== portToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addPort();
    }
  };

  if (!isEditing) {
    return (
      <div className="flex flex-wrap gap-1">
        {ports.length > 0 ? (
          ports.map(port => (
            <span
              key={port}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
            >
              {port}
            </span>
          ))
        ) : (
          <span className="text-gray-500 text-xs">Не указаны</span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {ports.map(port => (
          <span
            key={port}
            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
          >
            {port}
            <button
              type="button"
              onClick={() => removePort(port)}
              className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="number"
          value={newPort}
          onChange={(e) => setNewPort(e.target.value)}
          onKeyPress={handleKeyPress}
          min="1"
          max="65535"
          className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={addPort}
          disabled={!newPort.trim() || isNaN(parseInt(newPort.trim()))}
          className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>
    </div>
  );
};

const NodeDetailsCard: React.FC<NodeDetailsCardProps> = ({
  node,
  nodeData,
  isEditingMode,
  editValues,
  onValueChange,
  onSaveLinks,
  onEditStart,
  onEditSave,
  onEditCancel,
  saving = false,
  hideHeaderAndButtons = false
}) => {
  // Внутреннее состояние для справочников
  const [componentTypes, setComponentTypes] = useState<ComponentType[]>([]);
  const [ddGroupTypes, setDdGroupTypes] = useState<DdGroupType[]>([]);
  const [protocols, setProtocols] = useState<{ id: number; name: string; }[]>([]);
  const [allGroups, setAllGroups] = useState<DDGroupAPI[]>([]);
  const [ddLinks, setDdLinks] = useState<DDLink[]>([]);
  const [loading, setLoading] = useState(false);

  // Загружаем все необходимые справочники при монтировании компонента
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        
        const [componentTypesResponse, ddGroupTypesResponse, protocolsResponse, groupsResponse] = await Promise.all([
          fetch(`${apiUrl}/api/architecture/component-types`),
          fetch(`${apiUrl}/api/architecture/dd-group-types`),
          fetch(`${apiUrl}/api/architecture/dd-link-protocols`),
          fetch(`${apiUrl}/api/architecture/dd-groups`)
        ]);
        
        const [componentTypesData, ddGroupTypesData, protocolsData, groupsData] = await Promise.all([
          componentTypesResponse.json(),
          ddGroupTypesResponse.json(),
          protocolsResponse.json(),
          groupsResponse.json()
        ]);
        
        setComponentTypes(componentTypesData);
        setDdGroupTypes(ddGroupTypesData);
        setProtocols(protocolsData);
        setAllGroups(groupsData);
        
        // Проверяем, загрузилась ли группа oms-prod-4
        const omsGroup = groupsData.find((g: DDGroupAPI) => g.name === 'oms-prod-4');
        console.log('Группа oms-prod-4 загружена:', omsGroup);
        console.log('Всего групп загружено:', groupsData.length);
      } catch (error) {
        console.error('Ошибка загрузки справочников:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReferenceData();
  }, []);

  // Загружаем связи при изменении выбранного узла
  useEffect(() => {
    const loadLinks = async () => {
      if (!node || node.type !== 'group') {
        setDdLinks([]);
        return;
      }

      // Проверяем что node.data существует
      if (!node.data) {
        setDdLinks([]);
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const groupId = (node.data as DDGroupAPI).id;

        const response = await fetch(`${apiUrl}/api/architecture/dd-groups/${groupId}/links`);
        if (response.ok) {
          const linksData = await response.json();
          setDdLinks(linksData);
        } else {
          setDdLinks([]);
        }
      } catch (error) {
        console.error('Ошибка загрузки связей:', error);
        setDdLinks([]);
      }
    };

    loadLinks();
  }, [node]);

  // Определяем тип элемента
  const nodeType = node?.type || (editValues.group_id ? 'component' : editValues.parent_id !== undefined ? 'group' : null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Загрузка...</span>
      </div>
    );
  }

  if (!nodeType && !nodeData && !editValues.name) {
    return (
      <div className="text-center py-12 text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p>Компонент не выбран</p>
      </div>
    );
  }

  // Функции для работы со связями (только для групп)
  const addNewLink = () => {
    if (nodeType !== 'group') return;
    
    const groupId = nodeData?.id || null;
    const newLink = {
      id: Date.now() * -1, // Отрицательный ID для новых связей
      group_from_id: groupId, // По умолчанию исходящая связь
      group_to_id: null,
      protocol_id: null,
      ports: []
    };
    const updatedLinks = [...(editValues.links || []), newLink];
    onValueChange({ ...editValues, links: updatedLinks });
  };

  const removeLink = (linkIndex: number) => {
    if (nodeType !== 'group') return;
    
    const updatedLinks = (editValues.links || []).filter((_: any, index: number) => index !== linkIndex);
    onValueChange({ ...editValues, links: updatedLinks });
  };

  const updateLink = (linkIndex: number, field: string, value: any) => {
    if (nodeType !== 'group') return;
    
    const updatedLinks = [...(editValues.links || [])];
    updatedLinks[linkIndex] = { ...updatedLinks[linkIndex], [field]: value };
    onValueChange({ ...editValues, links: updatedLinks });
  };

  const updatePortsArray = (linkIndex: number, ports: number[]) => {
    if (nodeType !== 'group') return;
    
    updateLink(linkIndex, 'ports', ports);
  };

  // Инициализируем связи в editValues если их нет (только для групп)
  if (isEditingMode && nodeType === 'group' && !editValues.links) {
    editValues.links = ddLinks.map(link => ({
      id: link.id,
      group_from_id: link.group_from_id,
      group_to_id: link.group_to_id,
      protocol_id: link.protocol_id,
      ports: [...link.ports]
    }));
  }

  // Определяем какие связи показывать
  const currentLinks = isEditingMode ? (editValues.links || []) : ddLinks;
  const groupId = nodeType === 'group' ? nodeData?.id || null : null;

  // Функция для сохранения связей в бэкенд
  const saveLinks = async (groupId: number, links: any[]) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      // Получаем текущие связи группы
      const currentLinksResponse = await fetch(`${apiUrl}/api/architecture/dd-groups/${groupId}/links`);
      const currentLinks = currentLinksResponse.ok ? await currentLinksResponse.json() : [];
      
      // Определяем связи для удаления (есть в текущих, но нет в новых)
      const currentLinkIds = currentLinks.map((link: any) => link.id);
      const newLinkIds = links.filter(link => link.id && typeof link.id === 'number').map(link => link.id);
      const linksToDelete = currentLinkIds.filter((id: number) => !newLinkIds.includes(id));
      
      // Удаляем связи
      for (const linkId of linksToDelete) {
        await fetch(`${apiUrl}/api/architecture/dd-links/${linkId}`, {
          method: 'DELETE'
        });
      }
      
      // Обрабатываем каждую связь
      for (const link of links) {
        let linkId = link.id;
        
        // Если связь новая (id отрицательный или отсутствует), создаем её
        if (!linkId || linkId < 0) {
          const createResponse = await fetch(`${apiUrl}/api/architecture/dd-links`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              group_from_id: link.group_from_id,
              group_to_id: link.group_to_id,
              protocol_id: link.protocol_id
            })
          });
          
          if (createResponse.ok) {
            const createdLink = await createResponse.json();
            linkId = createdLink.id;
          } else {
            console.error('Ошибка создания связи:', await createResponse.text());
            continue;
          }
        } else {
          // Обновляем существующую связь
          await fetch(`${apiUrl}/api/architecture/dd-links/${linkId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              group_from_id: link.group_from_id,
              group_to_id: link.group_to_id,
              protocol_id: link.protocol_id
            })
          });
        }
        
        // Управляем портами связи
        if (linkId && Array.isArray(link.ports)) {
          // Получаем текущие порты связи
          const currentPortsResponse = await fetch(`${apiUrl}/api/architecture/dd-link-ports?dd_link_id=${linkId}`);
          const currentPorts = currentPortsResponse.ok ? await currentPortsResponse.json() : [];
          
          // Удаляем порты, которых нет в новом списке
          const currentPortValues = currentPorts.map((p: any) => p.port);
          const portsToDelete = currentPorts.filter((p: any) => !link.ports.includes(p.port));
          
          for (const port of portsToDelete) {
            await fetch(`${apiUrl}/api/architecture/dd-link-ports/${port.id}`, {
              method: 'DELETE'
            });
          }
          
          // Добавляем новые порты
          const portsToAdd = link.ports.filter((port: number) => !currentPortValues.includes(port));
          
          for (const port of portsToAdd) {
            await fetch(`${apiUrl}/api/architecture/dd-link-ports`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                dd_link_id: linkId,
                port: port
              })
            });
          }
        }
      }
      
      // Перезагружаем связи после сохранения
      const updatedLinksResponse = await fetch(`${apiUrl}/api/architecture/dd-groups/${groupId}/links`);
      if (updatedLinksResponse.ok) {
        const updatedLinks = await updatedLinksResponse.json();
        setDdLinks(updatedLinks);
      }
      
    } catch (error) {
      console.error('Ошибка сохранения связей:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-4">
      {/* Заголовок с кнопками */}
      {!hideHeaderAndButtons && (
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Детали компонента</h2>
            <p className="text-sm text-gray-600 mt-1">
              {node ? 'Информация о выбранном элементе' : 'Выберите компонент для просмотра деталей'}
            </p>
          </div>
          
          {/* Кнопки управления */}
          {node && (
            <div className="flex gap-2">
              {!isEditingMode ? (
                <button
                  onClick={onEditStart}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Изменить
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={onEditCancel}
                    disabled={saving}
                    className="flex items-center px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Отмена
                  </button>
                  <button
                    onClick={async () => {
                      // Сначала сохраняем связи если это группа
                      if (nodeType === 'group' && groupId && editValues.links) {
                        try {
                          await saveLinks(groupId, editValues.links);
                        } catch (error) {
                          console.error('Ошибка сохранения связей:', error);
                          alert('Ошибка при сохранении связей!');
                          return;
                        }
                      }
                      // Затем вызываем основное сохранение
                      if (onEditSave) {
                        await onEditSave();
                      }
                    }}
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
          )}
        </div>
      )}

      <div className="grid gap-4">
        {/* Поле "Название" - общее для всех типов */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Название</label>
          {isEditingMode ? (
            <input
              type="text"
              value={editValues.name || ''}
              onChange={(e) => onValueChange({ ...editValues, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-900 bg-gray-50 rounded-md px-3 py-2">{nodeData?.name || editValues.name || 'Не указано'}</p>
          )}
        </div>

        {/* Поля для группы */}
        {nodeType === 'group' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Экземпляры</label>
              {isEditingMode ? (
                <input
                  type="number"
                  value={editValues.instances || ''}
                  onChange={(e) => onValueChange({ ...editValues, instances: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                  {((nodeData as DDGroupAPI)?.instances !== undefined ? (nodeData as DDGroupAPI).instances : editValues.instances) !== null 
                    ? ((nodeData as DDGroupAPI)?.instances !== undefined ? (nodeData as DDGroupAPI).instances : editValues.instances)
                    : 'Не указано'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Спецификация</label>
              {isEditingMode ? (
                <textarea
                  value={editValues.specification || ''}
                  onChange={(e) => onValueChange({ ...editValues, specification: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                  {(nodeData as DDGroupAPI)?.specification || editValues.specification || 'Не указана'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Тип</label>
              {isEditingMode ? (
                <select
                  value={editValues.type_id || ''}
                  onChange={(e) => onValueChange({ ...editValues, type_id: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ddGroupTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                  {(nodeData as DDGroupAPI)?.type_name || ddGroupTypes.find(t => t.id === editValues.type_id)?.name || 'Не указан'}
                </p>
              )}
            </div>
          </>
        )}

        {/* Поля для компонента */}
        {nodeType === 'component' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Технология</label>
              {isEditingMode ? (
                <input
                  type="text"
                  value={editValues.technology || ''}
                  onChange={(e) => onValueChange({ ...editValues, technology: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                  {(nodeData as DDComponentAPI)?.technology || editValues.technology || 'Не указана'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Описание</label>
              {isEditingMode ? (
                <textarea
                  value={editValues.description || ''}
                  onChange={(e) => onValueChange({ ...editValues, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                  {(nodeData as DDComponentAPI)?.description || editValues.description || 'Не указано'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Внешний компонент</label>
              {isEditingMode ? (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editValues.is_external || false}
                    onChange={(e) => onValueChange({ ...editValues, is_external: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Внешний компонент</span>
                </div>
              ) : (
                <p className="text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                  {((nodeData as DDComponentAPI)?.is_external !== undefined ? (nodeData as DDComponentAPI).is_external : editValues.is_external) ? 'Да' : 'Нет'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Тип</label>
              {isEditingMode ? (
                <select
                  value={editValues.type_id || ''}
                  onChange={(e) => onValueChange({ ...editValues, type_id: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {componentTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              ) : (
                <p className="text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                  {(nodeData as DDComponentAPI)?.type_name || componentTypes.find(t => t.id === editValues.type_id)?.name || 'Не указан'}
                </p>
              )}
            </div>
          </>
        )}

        {/* Таблица связей - только для групп */}
        {nodeType === 'group' && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-600">
                Связи
              </label>
              <div className="flex gap-2">
                {isEditingMode && (
                  <>
                    <button
                      type="button"
                      onClick={addNewLink}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                      + Добавить связь
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="border border-gray-200 rounded-md">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Направление</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Группа</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Протокол</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Порты</th>
                    {isEditingMode && (
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Действия</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {currentLinks.length > 0 ? (
                    currentLinks.map((link: any, index: number) => {
                      const isIncoming = link.group_to_id === groupId;
                      const linkType = isIncoming ? 'Входящая' : 'Исходящая';
                      const otherGroupId = isIncoming ? link.group_from_id : link.group_to_id;
                      const otherGroup = allGroups.find(g => g.id === otherGroupId);
                      const protocol = protocols.find(p => p.id === link.protocol_id);
                      
                      return (
                        <tr key={`${link.id}-${index}`} className="border-t border-gray-200">
                          <td className="px-3 py-2">
                            {isEditingMode ? (
                              <select
                                value={isIncoming ? 'incoming' : 'outgoing'}
                                onChange={(e) => {
                                  const newIsIncoming = e.target.value === 'incoming';
                                  const currentIsIncoming = link.group_to_id === groupId;
                                  
                                  // Если направление не изменилось, ничего не делаем
                                  if (newIsIncoming === currentIsIncoming) {
                                    return;
                                  }
                                  
                                  // Меняем местами group_from_id и group_to_id
                                  const updatedLinks = [...(editValues.links || [])];
                                  updatedLinks[index] = { 
                                    ...updatedLinks[index], 
                                    group_from_id: link.group_to_id,
                                    group_to_id: link.group_from_id
                                  };
                                  onValueChange({ ...editValues, links: updatedLinks });
                                }}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                              >
                                <option value="incoming">Входящая</option>
                                <option value="outgoing">Исходящая</option>
                              </select>
                            ) : (
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                isIncoming 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {linkType}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            {isEditingMode ? (
                              <GroupSelector
                                value={otherGroupId}
                                onChange={(selectedGroupId) => {
                                  // Определяем текущее направление связи
                                  const currentIsIncoming = link.group_to_id === groupId;
                                  
                                  if (currentIsIncoming) {
                                    // Входящая связь: выбранная группа -> текущая группа
                                    updateLink(index, 'group_from_id', selectedGroupId);
                                  } else {
                                    // Исходящая связь: текущая группа -> выбранная группа
                                    updateLink(index, 'group_to_id', selectedGroupId);
                                  }
                                }}
                                groups={allGroups}
                                excludeGroupId={groupId}
                              />
                            ) : (
                              <span className="text-gray-900">{otherGroup?.name || 'Неизвестная группа'}</span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            {isEditingMode ? (
                              <select
                                value={link.protocol_id || ''}
                                onChange={(e) => updateLink(index, 'protocol_id', parseInt(e.target.value))}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                              >
                                {protocols.map(protocol => (
                                  <option key={protocol.id} value={protocol.id}>{protocol.name}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-gray-900">{protocol?.name || 'Неизвестный протокол'}</span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <PortTags
                              ports={Array.isArray(link.ports) ? link.ports : []}
                              isEditing={isEditingMode}
                              onChange={(ports) => updatePortsArray(index, ports)}
                            />
                          </td>
                          {isEditingMode && (
                            <td className="px-3 py-2">
                              <button
                                type="button"
                                onClick={() => removeLink(index)}
                                className="text-red-600 hover:text-red-800 text-xs"
                              >
                                Удалить
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={isEditingMode ? 5 : 4} className="px-3 py-4 text-center text-gray-500">
                        {isEditingMode ? 'Нажмите "Добавить связь" для создания новой связи' : 'Связи не найдены'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NodeDetailsCard; 
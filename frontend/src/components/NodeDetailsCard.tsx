import React from 'react';

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

interface NodeDetailsCardProps {
  node: DDTreeNode | null;
  nodeData: DDGroupAPI | DDComponentAPI | undefined;
  isEditingMode: boolean;
  editValues: any;
  onValueChange: (values: any) => void;
  componentTypes: ComponentType[];
  ddGroupTypes: DdGroupType[];
}

const NodeDetailsCard: React.FC<NodeDetailsCardProps> = ({
  node,
  nodeData,
  isEditingMode,
  editValues,
  onValueChange,
  componentTypes,
  ddGroupTypes
}) => {
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
                value={editValues.name || ''}
                onChange={(e) => onValueChange({ ...editValues, name: e.target.value })}
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
                value={editValues.instances || ''}
                onChange={(e) => onValueChange({ ...editValues, instances: e.target.value ? parseInt(e.target.value) : null })}
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
                value={editValues.specification || ''}
                onChange={(e) => onValueChange({ ...editValues, specification: e.target.value })}
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
                value={editValues.type_id || ''}
                onChange={(e) => onValueChange({ ...editValues, type_id: parseInt(e.target.value) })}
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
                value={editValues.name || ''}
                onChange={(e) => onValueChange({ ...editValues, name: e.target.value })}
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
                value={editValues.technology || ''}
                onChange={(e) => onValueChange({ ...editValues, technology: e.target.value })}
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
                value={editValues.description || ''}
                onChange={(e) => onValueChange({ ...editValues, description: e.target.value })}
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
                  checked={editValues.is_external || false}
                  onChange={(e) => onValueChange({ ...editValues, is_external: e.target.checked })}
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
                value={editValues.type_id || ''}
                onChange={(e) => onValueChange({ ...editValues, type_id: parseInt(e.target.value) })}
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

export default NodeDetailsCard; 
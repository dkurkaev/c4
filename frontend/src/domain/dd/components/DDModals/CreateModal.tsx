import React from 'react';
import NodeDetailsCard from '../../../../components/NodeDetailsCard';
import { CreateModalState } from '../../types';

interface CreateModalProps {
  createModal: CreateModalState;
  saving: boolean;
  onTypeSelect: (type: 'group' | 'component') => void;
  onValueChange: (values: any) => void;
  onCancel: () => void;
  onSave: () => void;
}

const CreateModal: React.FC<CreateModalProps> = ({
  createModal,
  saving,
  onTypeSelect,
  onValueChange,
  onCancel,
  onSave
}) => {
  if (!createModal.visible) return null;

  return (
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
                  onClick={() => onTypeSelect('group')}
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
                  onClick={() => onTypeSelect('component')}
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
              <NodeDetailsCard 
                node={{
                  id: `new-${createModal.createType}`,
                  name: 'Новый элемент',
                  type: createModal.createType
                }}
                nodeData={undefined} 
                isEditingMode={true} 
                editValues={createModal.editValues} 
                onValueChange={onValueChange}
                hideHeaderAndButtons={true}
              />
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Отмена
          </button>
          
          {createModal.createType && (
            <button
              onClick={onSave}
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
  );
};

export default CreateModal; 
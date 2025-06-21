import React from 'react';
import { MoveConfirmModalState } from '../../types';

interface MoveConfirmModalProps {
  moveConfirmModal: MoveConfirmModalState;
  saving: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const MoveConfirmModal: React.FC<MoveConfirmModalProps> = ({
  moveConfirmModal,
  saving,
  onConfirm,
  onCancel
}) => {
  if (!moveConfirmModal.visible) return null;

  return (
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
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Отмена
          </button>
          
          <button
            onClick={onConfirm}
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
  );
};

export default MoveConfirmModal; 
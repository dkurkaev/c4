import React from 'react';
import { DDTreeNode } from '../../types';

interface DeleteConfirmModalState {
  visible: boolean;
  node: DDTreeNode | null;
}

interface DeleteConfirmModalProps {
  deleteConfirmModal: DeleteConfirmModalState;
  saving: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  deleteConfirmModal,
  saving,
  onConfirm,
  onCancel
}) => {
  if (!deleteConfirmModal.visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Подтверждение удаления</h2>
          <p className="text-sm text-gray-600 mt-1">
            Вы уверены, что хотите удалить "{deleteConfirmModal.node?.name}"?
          </p>
          <p className="text-xs text-red-600 mt-2">
            Это действие нельзя будет отменить.
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
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Удаление...
              </div>
            ) : (
              'Удалить'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal; 
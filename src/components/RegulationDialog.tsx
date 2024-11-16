import React from 'react';

interface RegulationDialogProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  onClose: () => void;
  onSubmit: () => void;
  onDelete?: () => void;
  formData: {
    regulation_name: string;
    authority: string;
    update_date: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    regulation_name: string;
    authority: string;
    update_date: string;
  }>>;
}

const RegulationDialog: React.FC<RegulationDialogProps> = ({
  isOpen,
  mode,
  onClose,
  onSubmit,
  onDelete,
  formData,
  setFormData
}) => {
  if (!isOpen) return null;

  const handleDelete = () => {
    if (window.confirm('確定要刪除此法規嗎？')) {
      onDelete?.();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          {mode === 'add' ? '新增法規' : '編輯法規'}
        </h2>
        
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              法規名稱
            </label>
            <input
              type="text"
              value={formData.regulation_name}
              onChange={(e) => setFormData({
                ...formData,
                regulation_name: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              主管機關
            </label>
            <input
              type="text"
              value={formData.authority}
              onChange={(e) => setFormData({
                ...formData,
                authority: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              更新日期
            </label>
            <input
              type="date"
              value={formData.update_date}
              onChange={(e) => setFormData({
                ...formData,
                update_date: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <div>
            {mode === 'edit' && onDelete && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md"
              >
                刪除
              </button>
            )}
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              取消
            </button>
            <button
              onClick={onSubmit}
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              {mode === 'add' ? '新增' : '儲存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegulationDialog; 
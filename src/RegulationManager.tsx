import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Regulation {
  regulation_number: string;
  regulation_name: string;
  competent_authority: string;
  updated_at: string;
}

const RegulationManager: React.FC = () => {
  const navigate = useNavigate();
  const [regulations, setRegulations] = useState<Regulation[]>([]); // 假設這裡會從API獲取數據
  const [selectedRegulation, setSelectedRegulation] = useState<Regulation | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const [formData, setFormData] = useState<Omit<Regulation, 'regulation_number'>>({
    regulation_name: '',
    competent_authority: '',
    updated_at: ''
  });

  // 修改 API 地址使用环境变量
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = isEditing ? '/api/regulations/update' : '/api/regulations/create';
      const method = isEditing ? 'PUT' : 'POST';
      const body = isEditing 
        ? { 
            regulation_number: selectedRegulation?.regulation_number,
            regulation_name: formData.regulation_name,
            competent_authority: formData.competent_authority, 
            updated_at: formData.updated_at
          }
        : {
            regulation_name: formData.regulation_name,
            competent_authority: formData.competent_authority,
            updated_at: formData.updated_at
          };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('操作失敗');
      }

      // 重置表單和狀態
      setFormData({ regulation_name: '', competent_authority: '', updated_at: '' });
      setIsEditing(false);
      setSelectedRegulation(null);
      
      // 重新獲取法規列表
      const updatedData = await fetch(`${API_URL}/api/regulations`).then(res => res.json());
      setRegulations(updatedData);
      
    } catch (error) {
      console.error('提交失敗:', error);
      alert('操作失敗，請稍後再試');
    }
  };

  const handleDelete = (regulation: Regulation) => {
    setSelectedRegulation(regulation);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (deleteConfirmText === selectedRegulation?.regulation_name) {
      try {
        const response = await fetch(`${API_URL}/api/regulations/delete`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ regulation_number: selectedRegulation.regulation_number }),
        });

        if (!response.ok) {
          throw new Error('刪除失敗');
        }

        // 重置狀態
        setShowDeleteConfirm(false);
        setDeleteConfirmText('');
        setSelectedRegulation(null);

        // 重新獲取法規列表
        const updatedData = await fetch(`${API_URL}/api/regulations`).then(res => res.json());
        setRegulations(updatedData);

      } catch (error) {
        console.error('刪除失敗:', error);
        alert('刪除失敗，請稍後再試');
      }
    }
  };

  // 在組件加載時獲取法規列表
  useEffect(() => {
    const fetchRegulations = async () => {
      try {
        const response = await fetch(`${API_URL}/api/regulations`);
        const data = await response.json();
        setRegulations(data);
      } catch (error) {
        console.error('獲取法規列表失敗:', error);
      }
    };

    fetchRegulations();
  }, []);

  // 新增導航到條文編輯頁面的處理函數
  const handleEditArticles = (regulation: Regulation) => {
    navigate(`/bulk-edit/${regulation.regulation_number}`);
  };

  // 添加查閱條文的處理函數
  const handleViewArticles = (regulation: Regulation) => {
    navigate(`/select-law/${regulation.regulation_number}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">法規管理</h1>
        </div>

        {/* 法規列表 */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">法規列表</h2>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setSelectedRegulation(null);
                  setFormData({ regulation_name: '', competent_authority: '', updated_at: '' });
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                新增法規
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divregulation_numbere-y divregulation_numbere-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wregulation_numberer">法規名稱</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wregulation_numberer">主管機關</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wregulation_numberer">更新日期</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wregulation_numberer">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divregulation_numbere-y divregulation_numbere-gray-200">
                  {regulations.map((regulation) => (
                    <tr key={regulation.regulation_number}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/regulation/${regulation.regulation_number}`)}
                          className="text-blue-600 hover:text-blue-800 hover:underline text-left"
                        >
                          {regulation.regulation_name}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{regulation.competent_authority}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{regulation.updated_at}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditArticles(regulation)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          編輯條文
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setSelectedRegulation(regulation);
                            setFormData(regulation);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          編輯
                        </button>
                        <button
                          onClick={() => handleDelete(regulation)}
                          className="text-red-600 hover:text-red-900"
                        >
                          刪除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 表單區域 */}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            <h2 className="text-lg font-semibold mb-4">
              {isEditing ? '修改法規' : '新增法規'}
            </h2>
            <div className="grregulation_number grregulation_number-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  法規名稱
                </label>
                <input
                  type="text"
                  value={formData.regulation_name}
                  onChange={(e) => setFormData({ ...formData, regulation_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  主管機關
                </label>
                <input
                  type="text"
                  value={formData.competent_authority}
                  onChange={(e) => setFormData({ ...formData, competent_authority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  更新日期
                </label>
                <input
                  type="text"
                  value={formData.updated_at}
                  onChange={(e) => setFormData({ ...formData, updated_at: e.target.value })}
                  placeholder="例：民國112年5月31日"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setSelectedRegulation(null);
                  setFormData({ regulation_name: '', competent_authority: '', updated_at: '' });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                {isEditing ? '確認修改' : '確認新增'}
              </button>
            </div>
          </form>
        </div>

        {/* 刪除確認對話框 */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">確認刪除</h3>
              <p className="text-sm text-gray-500 mb-4">
                請輸入法規名稱「{selectedRegulation?.regulation_name}」以確認刪除
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm mb-4"
                placeholder="請輸入法規名稱"
              />
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteConfirmText !== selectedRegulation?.regulation_name}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                    ${deleteConfirmText === selectedRegulation?.regulation_name
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-gray-400 cursor-not-allowed'
                    }`}
                >
                  確認刪除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegulationManager; 
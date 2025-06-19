import React, { useState, useEffect } from 'react';
import { GroupTree } from './components/GroupTree';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

export function Page() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/architecture/dd-groups/`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setGroups(data);
      } catch (err) {
        setError(err.message);
        console.error('Ошибка при загрузке DD групп:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">DD - Deployment Diagrams</h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Загрузка групп DD...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">DD - Deployment Diagrams</h1>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">
            <strong>Ошибка загрузки:</strong> {error}
          </div>
          <div className="text-red-600 text-sm mt-2">
            Убедитесь, что бэкенд запущен на http://localhost:8000
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">DD - Deployment Diagrams</h1>
      <p className="text-lg text-gray-600">
        Диаграммы развертывания - схемы деплоймента приложений.
      </p>
      
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Группы DD ({groups.length})
          </h2>
        </div>
        <div className="p-6">
          <GroupTree groups={groups} />
        </div>
      </div>
    </div>
  );
} 
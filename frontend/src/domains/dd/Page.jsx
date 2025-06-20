import React, { useState, useEffect } from 'react';
import { GroupTree } from './components/GroupTree';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

export function Page() {
  const [groups, setGroups] = useState([]);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Загружаем группы и компоненты параллельно
        const [groupsResponse, componentsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/architecture/dd-groups/`),
          fetch(`${API_BASE_URL}/api/architecture/dd-components/`)
        ]);
        
        if (!groupsResponse.ok) {
          throw new Error(`HTTP error! status: ${groupsResponse.status}`);
        }
        if (!componentsResponse.ok) {
          throw new Error(`HTTP error! status: ${componentsResponse.status}`);
        }
        
        const groupsData = await groupsResponse.json();
        const componentsData = await componentsResponse.json();
        
        setGroups(groupsData);
        setComponents(componentsData);
      } catch (err) {
        setError(err.message);
        console.error('Ошибка при загрузке DD данных:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">DD - Deployment Diagrams</h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Загрузка данных DD...</div>
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
      <p className="text-gray-600 mb-6">
        Диаграммы развертывания - схемы деплоймента приложений.
      </p>
      
      <GroupTree groups={groups} components={components} />
    </div>
  );
} 
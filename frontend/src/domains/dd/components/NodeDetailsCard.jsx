import React from 'react';

export function NodeDetailsCard({ selectedNode }) {
  if (!selectedNode) {
    return null;
  }

  if (selectedNode.nodeType === 'group') {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-zinc-950/10 dark:border-white/10">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-zinc-950 dark:text-white">Группа DD</h3>
        </div>
        
        <dl className="grid grid-cols-1 text-sm/6">
          <div className="border-t border-zinc-950/5 pt-4 first:border-none first:pt-0 dark:border-white/5">
            <dt className="text-zinc-500 font-medium dark:text-zinc-400">Название</dt>
            <dd className="mt-1 text-zinc-950 dark:text-white">{selectedNode.name || 'Не указано'}</dd>
          </div>
          
          <div className="border-t border-zinc-950/5 pt-4 mt-4 dark:border-white/5">
            <dt className="text-zinc-500 font-medium dark:text-zinc-400">Тип</dt>
            <dd className="mt-1 text-zinc-950 dark:text-white">
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/20">
                {selectedNode.type_name || 'Не указано'}
              </span>
            </dd>
          </div>
        </dl>
      </div>
    );
  }

  if (selectedNode.nodeType === 'component') {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-zinc-950/10 dark:border-white/10">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-zinc-950 dark:text-white">Компонент DD</h3>
        </div>
        
        <dl className="grid grid-cols-1 text-sm/6">
          <div className="border-t border-zinc-950/5 pt-4 first:border-none first:pt-0 dark:border-white/5">
            <dt className="text-zinc-500 font-medium dark:text-zinc-400">Название</dt>
            <dd className="mt-1 text-zinc-950 dark:text-white">{selectedNode.name || 'Не указано'}</dd>
          </div>
          
          {selectedNode.technology && (
            <div className="border-t border-zinc-950/5 pt-4 mt-4 dark:border-white/5">
              <dt className="text-zinc-500 font-medium dark:text-zinc-400">Технология</dt>
              <dd className="mt-1 text-zinc-950 dark:text-white">
                <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10 dark:bg-purple-400/10 dark:text-purple-400 dark:ring-purple-400/20">
                  {selectedNode.technology}
                </span>
              </dd>
            </div>
          )}
          
          <div className="border-t border-zinc-950/5 pt-4 mt-4 dark:border-white/5">
            <dt className="text-zinc-500 font-medium dark:text-zinc-400">Тип компонента</dt>
            <dd className="mt-1 text-zinc-950 dark:text-white">
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-700/10 dark:bg-amber-400/10 dark:text-amber-400 dark:ring-amber-400/20">
                {selectedNode.type_name || 'Не указано'}
              </span>
            </dd>
          </div>
          
          {selectedNode.description && (
            <div className="border-t border-zinc-950/5 pt-4 mt-4 dark:border-white/5">
              <dt className="text-zinc-500 font-medium dark:text-zinc-400">Описание</dt>
              <dd className="mt-1 text-zinc-950 dark:text-white">{selectedNode.description}</dd>
            </div>
          )}
        </dl>
      </div>
    );
  }

  return null;
} 
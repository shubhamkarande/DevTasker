import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import { Task } from '../../types';

interface ColumnProps {
  id: string;
  title: string;
  tasks: Task[];
}

const Column: React.FC<ColumnProps> = ({ id, title, tasks }) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  const getColumnColor = (columnId: string) => {
    switch (columnId) {
      case 'todo': return 'border-red-200 bg-red-50';
      case 'in-progress': return 'border-yellow-200 bg-yellow-50';
      case 'done': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getHeaderColor = (columnId: string) => {
    switch (columnId) {
      case 'todo': return 'text-red-700 bg-red-100';
      case 'in-progress': return 'text-yellow-700 bg-yellow-100';
      case 'done': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div className={`bg-white rounded-lg border-2 ${getColumnColor(id)} ${isOver ? 'ring-2 ring-blue-500' : ''} transition-all`}>
      <div className={`p-4 border-b border-gray-200 ${getHeaderColor(id)} rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">
            {title}
            <span className="ml-2 px-2 py-1 bg-white bg-opacity-70 rounded-full text-xs">
              {tasks.length}
            </span>
          </h3>
          <button className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className="p-4 space-y-3 min-h-[400px] transition-colors"
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <div className="w-12 h-12 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-2">
              <Plus className="w-6 h-6" />
            </div>
            <p className="text-sm">Drop tasks here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Column;
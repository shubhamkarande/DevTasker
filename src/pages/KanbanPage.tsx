import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Plus, Filter, Search } from 'lucide-react';
import { RootState } from '../store';
import KanbanBoard from '../components/kanban/KanbanBoard';
import TaskDetailModal from '../components/tasks/TaskDetailModal';
import CreateTaskModal from '../components/tasks/CreateTaskModal';

const KanbanPage: React.FC = () => {
  const selectedTask = useSelector((state: RootState) => state.tasks.selectedTask);
  const currentProject = useSelector((state: RootState) => state.projects.currentProject);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6 h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
          <p className="text-gray-600 mt-1">
            {currentProject ? `Project: ${currentProject.name}` : 'All Projects'}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard />
      </div>

      {/* Modals */}
      {selectedTask && <TaskDetailModal />}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default KanbanPage;
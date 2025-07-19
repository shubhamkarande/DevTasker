import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { RootState } from '../../store';
import { moveTask, updateTask } from '../../store/tasksSlice';
import Column from './Column';
import TaskCard from './TaskCard';
import { Task } from '../../types';

const KanbanBoard: React.FC = () => {
  const dispatch = useDispatch();
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const columns = [
    { id: 'todo', title: 'To Do', status: 'todo' as const },
    { id: 'in-progress', title: 'In Progress', status: 'in-progress' as const },
    { id: 'done', title: 'Done', status: 'done' as const },
  ];

  const getTasksByStatus = (status: 'todo' | 'in-progress' | 'done') => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTaskId = active.id as string;
    const overColumnId = over.id as string;

    // Check if we're dropping on a column
    const targetColumn = columns.find(col => col.id === overColumnId);
    if (targetColumn) {
      dispatch(moveTask({ taskId: activeTaskId, newStatus: targetColumn.status }));
      return;
    }

    // Handle reordering within the same column or moving between columns
    const activeTask = tasks.find(t => t.id === activeTaskId);
    const overTask = tasks.find(t => t.id === over.id);

    if (!activeTask || !overTask) return;

    if (activeTask.status !== overTask.status) {
      // Moving between columns
      dispatch(moveTask({ taskId: activeTaskId, newStatus: overTask.status }));
    }
    // Note: For same-column reordering, we would need to implement order tracking
    // This is a simplified version that focuses on status changes
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {columns.map((column) => (
          <Column
            key={column.id}
            id={column.id}
            title={column.title}
            tasks={getTasksByStatus(column.status)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;
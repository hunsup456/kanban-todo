'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';

import { Column, Id, Task } from '../type';
import { ColumnContainer } from './ColumnContainer';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
const LOCAL_STORAGE_COLUMNS_KEY = 'kanban_columns';
const LOCAL_STORAGE_TASKS_KEY = 'kanban_tasks';

export const KanbanBoard = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);
  const [columnTitle, setColumnTitle] = useState<string>('');

  const [tasks, setTasks] = useState<Task[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  const generateId = () => {
    return Math.floor(Math.random() * 10001);
  };

  useEffect(() => {
    const storedColumns = localStorage.getItem('kanban_columns');
    if (storedColumns) {
      setColumns(JSON.parse(storedColumns));
    }
  }, []);
  useEffect(() => {
    const storedColumns = localStorage.getItem(LOCAL_STORAGE_COLUMNS_KEY);
    const storedTasks = localStorage.getItem(LOCAL_STORAGE_TASKS_KEY);

    if (storedColumns) setColumns(JSON.parse(storedColumns));
    if (storedTasks) setTasks(JSON.parse(storedTasks));
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_COLUMNS_KEY, JSON.stringify(columns));
  }, [columns]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const createColumn = (title: string) => {
    const columnToAdd: Column = {
      id: generateId(),
      title,
    };
    setColumns([...columns, columnToAdd]);
    setColumnTitle('');
  };
  const deleteColumn = (id: Id) => {
    const filteredColumn = columns.filter((col) => col.id !== id);
    setColumns(filteredColumn);
  };
  const updateColumn = (id: Id, title: string) => {
    const newColumns = columns.map((col) => {
      if (col.id !== id) return col;
      return { ...col, title };
    });

    setColumns(newColumns);
  };

  const createTask = (columnId: Id, content: string) => {
    const newTask: Task = {
      id: generateId(),
      columnId,
      content,
    };
    setTasks([...tasks, newTask]);
  };
  const deleteTask = (taskId: Id) => {
    const filteredTask = tasks.filter((task) => task.id !== taskId);
    setTasks(filteredTask);
  };
  const updateTask = (taskId: Id, content: string) => {
    const newTasks = tasks.map((task) => {
      if (task.id !== taskId) return task;
      return { ...task, content };
    });

    setTasks(newTasks);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeColumnId = active.id;
    const overColumnId = over.id;

    const isActiveATask = active.data.current?.type === 'Task';

    if (isActiveATask) return;

    if (activeColumnId === overColumnId) return;
    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex(
        (col) => col.id === activeColumnId
      );
      const overColumnIndex = columns.findIndex(
        (col) => col.id === overColumnId
      );

      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  };
  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTaskId = active.id;
    const overTaskId = over.id;

    if (activeTaskId === overTaskId) return;

    const isActiveATask = active.data.current?.type === 'Task';
    const isOverATask = over.data.current?.type === 'Task';
    const isOverAColumn = over.data.current?.type === 'Column';

    if (!isActiveATask) return;

    // 태스크 끼리 drag and drop

    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeTaskId);
        const overIndex = tasks.findIndex((t) => t.id === overTaskId);

        if (tasks[activeIndex].columnId !== tasks[overIndex].columnId) {
          tasks[activeIndex].columnId = tasks[overIndex].columnId;
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    //태스크에서 보드로
    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const updatedTasks = tasks.map((task) => {
          if (task.id === activeTaskId) {
            return { ...task, columnId: overTaskId };
          }
          return task;
        });

        return updatedTasks;
      });
    }
  };
  return (
    <div>
      <div className='p-4'>
        <div className='mb-2'>보드 추가</div>
        <div className='flex'>
          <input
            value={columnTitle}
            onChange={(e) => setColumnTitle(e.target.value)}
            className='h-[30px] w-[330px] min-w-[350px] cursor-text rounded-lg bg-slate-200 border-2 border-slate-400 p-4 ring-rose-500 flex gap-2'
          ></input>
          <Button
            onClick={() => createColumn(columnTitle)}
            className='w-[100px] ml-3 border border-slate-400'
          >
            추가
          </Button>
        </div>
      </div>
      <div className='m-auto flex w-full items-center overflow-x-auto overflow-y-hidden px-[40px]'>
        <DndContext
          sensors={sensors}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
        >
          <div className='m-auto flex gap-4'>
            <div className='flex gap-4'>
              <SortableContext items={columnsId}>
                {columns.map((column) => (
                  <ColumnContainer
                    key={column.id}
                    column={column}
                    deleteColumn={deleteColumn}
                    updateColumn={updateColumn}
                    createTask={createTask}
                    deleteTask={deleteTask}
                    updateTask={updateTask}
                    tasks={tasks.filter((task) => task.columnId === column.id)}
                  />
                ))}
              </SortableContext>
            </div>
          </div>
        </DndContext>
      </div>
    </div>
  );
};

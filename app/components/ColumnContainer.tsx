import React, { useMemo, useState } from 'react';
import { Id, Column, Task } from '../type';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskCard } from './TaskCard';
import { Button } from '@/components/ui/button';

interface Props {
  column: Column;
  deleteColumn: (id: Id) => void;
  updateColumn: (id: Id, title: string) => void;

  createTask: (columnId: Id, content: string) => void;
  deleteTask: (id: Id) => void;
  updateTask: (taskId: Id, content: string) => void;
  tasks: Task[];
}

export const ColumnContainer = (props: Props) => {
  const {
    column,
    deleteColumn,
    updateColumn,
    createTask,
    deleteTask,
    updateTask,
    tasks,
  } = props;

  const [taskContent, setTaskContent] = useState<string>('');

  const [editMode, setEditMode] = useState<boolean>(false);

  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
  };

  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

  const { setNodeRef, attributes, listeners, transform, transition } =
    useSortable({
      id: column.id,
      data: {
        type: 'Column',
        column,
      },
      disabled: editMode,
    });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className='bg-slate-300 w-[280px] min-h-[500px] max-h-[500px] rounded-md flex flex-col'
    >
      <div
        {...attributes}
        {...listeners}
        className='bg-slate-200 text-md h-[60px] cursor-grab rounded-md rounded-b-none p-3 font-bold border-slate-300 border-4 flex items-center justify-between'
      >
        <div className='flex gap-2'>
          {editMode ? (
            <input
              className='bg-slate-50 text-black font-normal rounded-md p-1'
              value={column.title}
              onChange={(e) => updateColumn(column.id, e.target.value)}
              autoFocus
            ></input>
          ) : (
            column.title
          )}
        </div>
        <div className='flex gap-4'>
          <Button onClick={toggleEditMode}>{editMode ? '완료' : '수정'}</Button>
          <Button onClick={() => deleteColumn(column.id)}>삭제</Button>
        </div>
      </div>

      <div className='flex flex-grow flex-col gap-4 p-2 overflow-y-auto'>
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              deleteTask={deleteTask}
              updateTask={updateTask}
            />
          ))}
        </SortableContext>
      </div>
      <div className='flex flex-col p-4 gap-2'>
        <p className='flex space-between items-center border-slate-300 border-2 rounded-md'>
          작업 추가
        </p>

        <div className='flex'>
          <input
            className='text-black rounded-md bg-slate-50 p-1'
            value={taskContent}
            onChange={(e) => setTaskContent(e.target.value)}
          ></input>
          <Button
            className='w-[50px] ml-3 border-slate-300 rounded-md'
            onClick={() => {
              createTask(column.id, taskContent);
            }}
          >
            추가
          </Button>
        </div>
      </div>
    </div>
  );
};

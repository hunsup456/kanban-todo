'use client';
import React, { useState } from 'react';
import { Task, Id } from '../type';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
interface Props {
  task: Task;
  deleteTask: (taskId: Id) => void;
  updateTask: (taskId: Id, content: string) => void;
}

export const TaskCard = ({ task, deleteTask, updateTask }: Props) => {
  const [editMode, setEditMode] = useState<boolean>(false);

  const { setNodeRef, attributes, listeners, transform, transition } =
    useSortable({
      id: task.id,
      data: {
        type: 'Task',
        task,
      },
      disabled: editMode,
    });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const toggleEditMode = () => {
    setEditMode((prev) => !prev);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className='bg-slate-200 p-2.5 h-[80px] min-h-[80px] items-center flex text-left rounded-md cursor-grab relative'
    >
      {editMode ? (
        <textarea
          className='h-[90%] resize-none border-none rounded bg-slate-50 text-black'
          value={task.content}
          autoFocus
          placeholder='내용을 입력하세요'
          onChange={(e) => updateTask(task.id, e.target.value)}
        ></textarea>
      ) : (
        <p className='my-auto h-[90%] w-full overflow-y-auto overflow-x-auto whitespace-pre-wrap'>
          {task.content}
        </p>
      )}

      <div className='flex gap-2'>
        <Button onClick={toggleEditMode} className='w-[30px] h-[30px]'>
          {editMode ? '완료' : '수정'}
        </Button>

        <Button
          onClick={() => deleteTask(task.id)}
          className='w-[30px] h-[30px]'
        >
          삭제
        </Button>
      </div>
    </div>
  );
};

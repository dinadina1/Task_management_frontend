import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cva } from "class-variance-authority";
import { Card } from "../../components/ui/card";
import {
  AiOutlineMore,
  AiOutlineCalendar,
  AiOutlinePaperClip,
  AiOutlineMessage,
  AiOutlineCheckSquare,
  AiOutlineDown,
  AiOutlineUp,
} from "react-icons/ai";
import { HiOutlineClipboardList } from "react-icons/hi";
import { Task } from "../../utilities/types/task";
import { useState } from "react";

interface TaskCardProps {
  task: Task | any;
  isOverlay?: boolean;
}

export type TaskType = "task";

export interface TaskDragData {
  type: TaskType;
  task: any;
}

const TaskCard = ({ task, isOverlay }: TaskCardProps) => {
  const [isTaskMenuOpen, setIsTaskMenuOpen] = useState(false);
  const [isSubtasksOpen, setIsSubtasksOpen] = useState(false);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task,
    } satisfies TaskDragData,
    attributes: {
      roleDescription: "task",
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const variants = cva("", {
    variants: {
      dragging: {
        over: "ring-2 opacity-30",
        overlay: "ring-2 ring-primary",
      },
    },
  });

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={variants({
        dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
      })}
    >
      {/* <CardContent className="px-3 pt-3 pb-6 text-left whitespace-pre-wrap">
        {task.title}
      </CardContent> */}

      <div
        onMouseLeave={() => {setIsTaskMenuOpen(false); setIsSubtasksOpen(false)}}
        className="bg-white shadow-md rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-lg"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {task.title}
            </h2>
            <p className="text-sm text-gray-500">#{task.id}</p>
          </div>
          {/* Menu */}
          <div className="relative inline-block text-left">
            <button
              onMouseEnter={() => setIsTaskMenuOpen(true)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <AiOutlineMore className="h-5 w-5 text-gray-500" />
            </button>
            {isTaskMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-1 py-1">
                  <button className="w-full text-left px-2 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900">
                    Edit
                  </button>
                  <button className="w-full text-left px-2 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900">
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Task Info */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <HiOutlineClipboardList className="h-4 w-4 text-gray-400" />
            <p className="text-sm text-gray-600 truncate">{task.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <AiOutlineCalendar className="h-4 w-4 text-gray-400" />
            <p className="text-sm text-gray-600">{task.dueDate}</p>
          </div>
        </div>
        {/* Footer */}
        <div className="mt-4 flex justify-between items-center">
          <div className="flex -space-x-2">
            {task.assignee.map((user: any) => (
              <img
                key={user.id}
                className="h-8 w-8 rounded-full border-2 border-white"
                src={user.avatar}
                alt={user.name}
              />
            ))}
          </div>
          <div className="flex space-x-2 text-gray-400">
            <div className="flex items-center space-x-1">
              <AiOutlinePaperClip className="h-4 w-4" />
              <span className="text-xs">{task.attachments.length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <AiOutlineMessage className="h-4 w-4" />
              <span className="text-xs">{task.comments.length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <AiOutlineCheckSquare className="h-4 w-4" />
              <span className="text-xs">{task.subtasks.length}</span>
            </div>
          </div>
        </div>
        {/* Subtasks Toggle */}
        {task.subtasks.length > 0 && (
          <div className="mt-4">
            <button
              onMouseEnter={() => setIsSubtasksOpen(!isSubtasksOpen)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              {isSubtasksOpen ? (
                <>
                  <AiOutlineUp className="mr-1" />
                  Collapse Subtasks
                </>
              ) : (
                <>
                  <AiOutlineDown className="mr-1" />
                  Show Subtasks
                </>
              )}
            </button>
            {isSubtasksOpen && (
              <ul className="mt-2 space-y-2">
                {task.subtasks.map((subtask: any, index: number) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-100 rounded-md"
                  >
                    <span className="text-sm text-gray-700">
                      {subtask.title}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        subtask.completed
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {subtask?.completed ? "Completed" : "Pending"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default TaskCard;

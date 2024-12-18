import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Column, Id } from "../types/types";
import { useState } from "react";

interface Props {
  column: Column;
  deleteColumn: (id: Id) => void;
  updateColumnTitle: (id: Id, title: string) => void;
}

export const KanbanColumnContainer = (props: Props) => {
  const { column, deleteColumn, updateColumnTitle } = props;

  const [editMode, setEditMode] = useState(false);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="border-2 border-gray-600 bg-gray-800 text-white border-gray-600 rounded w-[350px] h-[500px] max-h-[500px] opacity-60"
      >        
      </div>
    );
  }

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent conflicts with DnD events.
    deleteColumn(column.id); // Call the delete function with the correct ID.
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border-2 bg-gray-800 text-white border-gray-600 rounded w-[350px] h-[500px] max-h-[500px]"
    >
      {/* column title */}
      <div className="bg-gray-900 text-white text-md rounded-md p-3 font-bold border-b-2 border-gray-600 flex justify-between items-center">
        <div 
        {...attributes} 
        {...listeners} 
        className="flex gap-2"
        onClick={() => setEditMode(true)}
        >
          <div>
          {
            !editMode && <span className="text-sm">{column.title}</span>
          }
          {editMode && (
            <input
              className="bg-gray-900 border rounded outline-none px-2"
              value={column.title}
              onChange={(e) => updateColumnTitle(column.id, e.target.value)}
              autoFocus
              onBlur={() => {
                setEditMode(false);
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                setEditMode(false);
              }}
            />
          )}
          </div>
        
        <button
          onClick={handleDelete}
          className="text-gray-500 hover:text-gray-300"
        >
          X
        </button>
        </div>
      </div>

      {/* column task container */}
    </div>
  );

};

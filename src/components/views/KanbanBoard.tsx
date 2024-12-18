import { useMemo, useState } from "react";
import { Column, Id } from "../types/types";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { KanbanColumnContainer } from "./KanbanColumnContainer";
import { createPortal } from "react-dom";

export const KanbanBoard = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const columnId = useMemo(() => columns.map((col) => col.id), [columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 300, //300px
      },
    })
  );

  const deleteColumn = (id: Id): void => {
    const filteredColumns = columns.filter((col) => col.id !== id);
    setColumns(filteredColumns);
  };

  function updateColumnTitle(id: Id, title: string) {
    const newColumns = columns.map((col) => {
      if (col.id !== id) return col;
      return { ...col, title };
    });
    console.log(newColumns);
    
    setColumns(newColumns);
  };

  return (
    <>
      <div className="m-auto flex min-h-52 w-full justify-start overflow-x-auto overflow-y-hidden items-start">
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
          <div className="flex gap-4 items-start">
            <SortableContext items={columnId}>
              {columns.map((col, index) => {
                return (
                  <KanbanColumnContainer
                    key={index}
                    column={col}
                    deleteColumn={deleteColumn}
                    updateColumnTitle= {updateColumnTitle}
                  />
                );
              })}
            </SortableContext>
            <div className="flex flex-col items-center">
              <button
                onClick={createNewColumn}
                className="bg-gray-600 px-3 py-2 text-white rounded"
              >
                + Add column
              </button>
            </div>

            {createPortal(
              <DragOverlay>
                {activeColumn && (
                  <KanbanColumnContainer
                    column={activeColumn}
                    deleteColumn={deleteColumn}                    
                    updateColumnTitle= {updateColumnTitle}
                  />
                )}
              </DragOverlay>,
              document.body
            )}
          </div>
        </DndContext>
      </div>
    </>
  );

  function createNewColumn() {
    const columntoAdd: Column = {
      id: generateId(),
      title: `Column ${columns.length + 1}`,
    };

    setColumns([...columns, columntoAdd]);
  }

  function generateId() {
    return Math.floor(Math.random() * 10001);
  }

  function onDragStart(event: DragStartEvent) {
    console.log(event);

    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    console.log(event);

    const { active, over } = event;
    if (!over) return;

    const activeColumnId = active.id;
    const overColumnId = over.id;

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
  }
};

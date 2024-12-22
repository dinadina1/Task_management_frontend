import React, { useMemo } from "react";
import { Section, Task } from "../../utilities/types/types";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cva } from "class-variance-authority";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import TaskCard from "./TaskCard";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { ScrollBar } from "../../components/ui/scroll-area";
import { useDndContext } from "@dnd-kit/core";

export interface SectionDragData {
  type: "section";
  section: Section;
}

interface BoardSectionProps {
  section: Section;
  tasks: Task[];
  isOverlay?: boolean;
}

const BoardSection = ({ section, tasks, isOverlay }: BoardSectionProps) => {
  const taskIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  const {
    setNodeRef,
    listeners,
    attributes,
    isDragging,
    transform,
    transition,
  } = useSortable({
    id: section.id,
    data: { type: "section", section } satisfies SectionDragData,
    attributes: { roleDescription: `Section: ${section.title}` },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const sectionClass = cva(
    "h-[500px] max-h-[500px] w-[350px] max-w-full bg-primary-foreground flex flex-col flex-shrink-0 snap-center",
    {
      variants: {
        dragging: {
          default: "border-2 border-transparent",
          over: "ring-2 opacity-30",
          overlay: "ring-2 ring-primary",
        },
      },
    }
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-66 overflow-y-auto h-screen"
    >
      <SortableContext items={taskIds}>
        <Card
          className={sectionClass({
            dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
          })}
        >
          <CardHeader
            {...attributes}
            {...listeners}
            className="p-4 font-semibold border-b-2 text-left"
          >
            {section.title}
          </CardHeader>
          <ScrollArea>
            <CardContent className="flex flex-grow flex-col gap-2 p-2">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </CardContent>
          </ScrollArea>
        </Card>
      </SortableContext>
    </div>
  );
};

export default BoardSection;

export function BoardContainer({ children }: { children: React.ReactNode }) {
  const dndContext = useDndContext();

  const variations = cva(
    "px-2 md:px-0 flex lg:justify-left pb-4 border-2 border-gray-400 overflow-x-auto",
    {
      variants: {
        dragging: {
          default: "snap-x snap-mandatory",
          active: "snap-none",
        },
      },
    }
  );

  return (
    <ScrollArea
      className={variations({
        dragging: dndContext.active ? "active" : "default",
      })}
    >
      <div className="flex gap-4 items-center flex-row justify-center">
        {children}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

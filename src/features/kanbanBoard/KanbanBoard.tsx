import { FC, useEffect, useMemo, useRef, useState } from "react";
import tasksData from "../../data/tasksData.json";
import sectionsData from "../../data/sections.json";
import { Section } from "../../utilities/types/types";
import {
  Announcements,
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import BoardSection, { BoardContainer } from "./BoardSection";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";
import { hasDraggableData } from "./utilities";

export type SectionId = (typeof sectionsData)[number]["id"];

const KanbanBoard: FC = () => {
  const [tasks, setTasks] = useState<any[]>(
    localStorage.getItem("tasks")
      ? JSON.parse(localStorage.getItem("tasks") as string)
      : tasksData
  );
  const [sections, setSections] = useState<Section[]>(
    localStorage.getItem("sections")
      ? JSON.parse(localStorage.getItem("sections") as string)
      : sectionsData
  );
  const [activeSection, setActiveSection] = useState<any>(null);
  const [activeTask, setActiveTask] = useState<any>(null);

  useEffect(() => {
    if (!localStorage.getItem("tasks")) {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    if (!localStorage.getItem("sections")) {
      localStorage.setItem("sections", JSON.stringify(sections));
    }
  }, [tasks, sections]);

  // state for picked up task and section
  const pickedUpTaskSection = useRef<SectionId | null>(null);

  // memoized sections id array
  const sectionsId = useMemo(() => sections.map((sec) => sec.id), [sections]);

  // sensors for drag and drop functionality
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  function getDraggingTaskData(taskId: UniqueIdentifier, sectionId: SectionId) {
    const tasksInSection = tasks.filter((task) => task.section === sectionId);
    const taskPosition = tasksInSection.findIndex((task) => task.id === taskId);
    const section = sections.find((col) => col.id === sectionId);

    return {
      tasksInSection,
      taskPosition,
      section,
    };
  }

  const announcements: Announcements = {
    onDragStart({ active }) {
      if (!hasDraggableData(active)) return;

      if (active.data.current?.type === "section") {
        const startColumnIdx = sectionsId.findIndex((id) => id === active.id);
        const startColumn = sections[startColumnIdx];

        return `Picked up Section ${startColumn?.title} at position: ${
          startColumnIdx + 1
        } of ${sectionsId.length}`;
      } else if (active.data.current?.type === "section") {
        const { tasksInSection, taskPosition, section } = getDraggingTaskData(
          active.id,
          active.data.current.task.sectionId
        );

        return `Picked up Task ${
          active.data.current.task.content
        } at position: ${taskPosition + 1} of ${
          tasksInSection.length
        } in Section ${section?.title}`;
      }
    },
    onDragOver({ active, over }: any) {
      if (!hasDraggableData(active) || !hasDraggableData(over)) return;

      if (
        active.data.current?.type === "section" &&
        over.data.current?.type === "section"
      ) {
        const overColumnIdx = sectionsId.findIndex((id) => id === over.id);

        return `Section ${active.data.current.section.title} was moved over ${
          over.data.current.section.title
        } at position ${overColumnIdx + 1} of ${sectionsId.length}`;
      } else if (
        active.data.current?.type === "task" &&
        over.data.current?.type === "task"
      ) {
        const { tasksInSection, taskPosition, section } = getDraggingTaskData(
          over.id,
          over.data.current.task.columnId
        );
        if (over.data.current.task.columnId !== pickedUpTaskSection.current) {
          return `Task ${
            active.data.current.task.content
          } was moved over Section ${section?.title} in position ${
            taskPosition + 1
          } of ${tasksInSection.length}`;
        }
        return `Task was moved over position ${taskPosition + 1} of ${
          tasksInSection.length
        } in column ${section?.title}`;
      }
    },
    onDragEnd({ active, over }: any) {
      if (!hasDraggableData(active) || !hasDraggableData(over)) {
        pickedUpTaskSection.current = null;
        return;
      }
      if (
        active.data.current?.type === "section" &&
        over.data.current?.type === "section"
      ) {
        const overColumnPosition = sectionsId.findIndex((id) => id === over.id);

        return `Section ${
          active.data.current.section.title
        } was dropped into position ${overColumnPosition + 1} of ${
          sectionsId.length
        }`;
      } else if (
        active.data.current?.type === "task" &&
        over.data.current?.type === "task"
      ) {
        const { tasksInSection, taskPosition, section } = getDraggingTaskData(
          over.id,
          over.data.current.task.section
        );
        if (over.data.current.task.columnId !== pickedUpTaskSection.current) {
          return `Task was dropped into section ${section?.title} in position ${
            taskPosition + 1
          } of ${tasksInSection.length}`;
        }
        return `Task was dropped into position ${taskPosition + 1} of ${
          tasksInSection.length
        } in column ${section?.title}`;
      }
      pickedUpTaskSection.current = null;
    },
    onDragCancel({ active }) {
      pickedUpTaskSection.current = null;
      if (!hasDraggableData(active)) return;
      return `Dragging ${active.data.current?.type} cancelled.`;
    },
  };

  return (
    <DndContext
      accessibility={{
        announcements,
      }}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={sectionsId}>
        <BoardContainer>
          {sections.map((sec, index) => {
            return (
              <BoardSection
                key={index}
                section={sec}
                tasks={tasks.filter((task) => task.section === sec.id)}
              />
            );
          })}
        </BoardContainer>
      </SortableContext>

      {"document" in window &&
        createPortal(
          <DragOverlay>
            {activeSection && (
              <BoardSection
                isOverlay
                section={activeSection}
                tasks={tasks.filter(
                  (task) => task.columnId === activeSection.id
                )}
              />
            )}
            {activeTask && <TaskCard task={activeTask} isOverlay />}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  );

  function onDragStart(event: DragStartEvent) {
    if (!hasDraggableData(event.active)) return;
    const data = event.active.data.current;
    if (data?.type === "section") {
      setActiveSection(data.section);
      return;
    }

    if (data?.type === "task") {
      setActiveTask(data.task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveSection(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (!hasDraggableData(active)) return;

    const activeData = active.data.current;

    if (activeId === overId) return;

    const isActiveASection = activeData?.type === "section";
    if (!isActiveASection) return;

    setSections((columns) => {
      const activeColumnIndex = columns.findIndex((col) => col.id === activeId);
      const overColumnIndex = columns.findIndex((col) => col.id === overId);

      const updatedSections = arrayMove(
        columns,
        activeColumnIndex,
        overColumnIndex
      );

      // Save updated sections to localStorage
      localStorage.setItem("sections", JSON.stringify(updatedSections));

      return updatedSections;
    });
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    if (!hasDraggableData(active) || !hasDraggableData(over)) return;

    const activeData: any = active.data.current;
    const overData: any = over.data.current;

    const isActiveATask = activeData?.type === "task";
    const isOverATask = overData?.type === "task";

    if (!isActiveATask) return;

    // I'm dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);
        const activeTask = tasks[activeIndex];
        const overTask = tasks[overIndex];

        if (activeTask && overTask && activeTask.section !== overTask.section) {
          activeTask.section = overTask.section;
          const updatedTasks = arrayMove(tasks, activeIndex, overIndex - 1);

          // Save updated tasks to localStorage
          localStorage.setItem("tasks", JSON.stringify(updatedTasks));

          return updatedTasks;
        }

        const updatedTasks = arrayMove(tasks, activeIndex, overIndex);

        // Save updated tasks to localStorage
        localStorage.setItem("tasks", JSON.stringify(updatedTasks));

        return updatedTasks;
      });
    }

    const isOverAColumn = overData?.type === "section";

    // I'm dropping a Task over a column
    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const activeTask = tasks[activeIndex];
        if (activeTask) {
          activeTask.section = overId as SectionId;

          const updatedTasks = arrayMove(tasks, activeIndex, activeIndex);

          // Save updated tasks to localStorage
          localStorage.setItem("tasks", JSON.stringify(updatedTasks));

          return updatedTasks;
        }
        return tasks;
      });
    }
  }

  // function onDragEnd(event: DragEndEvent) {
  //   setActiveSection(null);
  //   setActiveTask(null);

  //   const { active, over } = event;
  //   if (!over) return;

  //   const activeId = active.id;
  //   const overId = over.id;

  //   if (!hasDraggableData(active)) return;

  //   const activeData = active.data.current;

  //   if (activeId === overId) return;

  //   const isActiveASection = activeData?.type === "section";
  //   if (!isActiveASection) return;

  //   setSections((columns) => {
  //     const activeColumnIndex = columns.findIndex((col) => col.id === activeId);

  //     const overColumnIndex = columns.findIndex((col) => col.id === overId);

  //     return arrayMove(columns, activeColumnIndex, overColumnIndex);
  //   });

  //   // localStorage.setItem("sections", JSON.stringify(tasks));
  // }

  // function onDragOver(event: DragOverEvent) {
  //   const { active, over } = event;
  //   if (!over) return;

  //   const activeId = active.id;
  //   const overId = over.id;

  //   if (activeId === overId) return;

  //   if (!hasDraggableData(active) || !hasDraggableData(over)) return;

  //   const activeData: any = active.data.current;
  //   const overData: any = over.data.current;

  //   const isActiveATask = activeData?.type === "task";
  //   const isOverATask = overData?.type === "task";

  //   if (!isActiveATask) return;

  //   // Im dropping a Task over another Task
  //   if (isActiveATask && isOverATask) {
  //     setTasks((tasks) => {
  //       const activeIndex = tasks.findIndex((t) => t.id === activeId);
  //       const overIndex = tasks.findIndex((t) => t.id === overId);
  //       const activeTask = tasks[activeIndex];
  //       const overTask = tasks[overIndex];
  //       if (activeTask && overTask && activeTask.section !== overTask.section) {
  //         activeTask.section = overTask.section;
  //         return arrayMove(tasks, activeIndex, overIndex - 1);
  //       }

  //       return arrayMove(tasks, activeIndex, overIndex);
  //     });
  //   }

  //   const isOverAColumn = overData?.type === "section";

  //   // Im dropping a Task over a column
  //   if (isActiveATask && isOverAColumn) {
  //     setTasks((tasks) => {
  //       const activeIndex = tasks.findIndex((t) => t.id === activeId);
  //       const activeTask = tasks[activeIndex];
  //       if (activeTask) {
  //         activeTask.section = overId as SectionId;
  //         return arrayMove(tasks, activeIndex, activeIndex);
  //       }
  //       return tasks;
  //     });

  //     localStorage.setItem("tasks", JSON.stringify(tasks));
  //   }
  // }
};

export default KanbanBoard;

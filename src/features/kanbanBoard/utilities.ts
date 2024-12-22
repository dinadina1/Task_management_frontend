import { Active, DataRef, Over } from "@dnd-kit/core";
import { SectionDragData } from "./BoardSection";

type DraggableData = SectionDragData;

export function hasDraggableData<T extends Active | Over>(entry: T | null | undefined):
    entry is T & {
        data: DataRef<DraggableData>;
    } {
    if (!entry) {
        return false;
    }

    const data = entry.data.current;

    if (data?.type === "section" || data?.type === "task") {
        return true;
    }

    return false;
}

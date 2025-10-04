import "./index.css";
import {
  CSSProperties,
  forwardRef,
  HTMLProps,
  useEffect,
  useState,
} from "react";
import ReactDOM from "react-dom/client";

import {
  Cell,
  ColumnDef,
  Header,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  SortingState,
  getPaginationRowModel,
  getSortedRowModel,
  OnChangeFn,
} from "@tanstack/react-table";
// import { fetchData, makeData, Person, PersonApiResponse } from "./makeData";

// import {
//   keepPreviousData,
//   QueryClient,
//   QueryClientProvider,
//   useInfiniteQuery,
// } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { TableHeadProps } from "../../types";
import { cn } from "../../lib/utils";

const fetchSize = 100;

const DraggableTableHeader = ({ header }: { header: Header<T, unknown> }) => {
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useSortable({
      id: header.column.id,
    });

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: "relative",
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition: "width transform 0.2s ease-in-out",
    whiteSpace: "nowrap",
    width: header.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <th colSpan={header.colSpan} ref={setNodeRef} style={style}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div
          {...{
            className: header.column.getCanSort()
              ? "cursor-pointer select-none"
              : "",
            onClick: header.column.getToggleSortingHandler(),
          }}
          style={{ flex: 1, display: "flex", alignItems: "center" }}
        >
          {header.isPlaceholder
            ? null
            : flexRender(header.column.columnDef.header, header.getContext())}
          {{
            asc: " 🔼",
            desc: " 🔽",
          }[header.column.getIsSorted() as string] ?? null}
        </div>
        <button
          {...attributes}
          {...listeners}
          style={{ marginLeft: "8px", cursor: "grab" }}
        >
          🟰
        </button>
      </div>
    </th>
  );
};

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ children, className, ...props }, ref) => (
    <th
      ref={ref}
      data-slot="table-head"
      className={cn(
        "py-3.5 font-semibold text-left px-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    >
      {children}
    </th>
  )
);
TableHead.displayName = "TableHead";

const Table = () => {
  return <div>Table</div>;
};

export default Table;

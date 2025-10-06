import React, { CSSProperties, forwardRef, HTMLProps, useEffect } from "react";
import {
  Cell,
  Header,
  flexRender,
  Table as TanStackTable,
} from "@tanstack/react-table";
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
import { TableCellProps, TableHeaderProps, TableHeadProps, TableProps } from "../../types";
import { cn } from "../../lib/utils";

const DraggableTableHeader = <T,>({ header }: { header: Header<T, unknown> }) => {
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useSortable({
      id: header.column.id,
    });

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: "relative",
    transform: CSS.Translate.toString(transform),
    transition: "width transform 0.2s ease-in-out",
    whiteSpace: "nowrap",
    width: header.column.getSize(),
    minWidth: header.column.getSize(),
    maxWidth: header.column.getSize(),
    zIndex: isDragging ? 1 : 0,
    boxSizing: "border-box",
  };

  return (
    <TableHead colSpan={header.colSpan} ref={setNodeRef} style={style}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div
          {...attributes}
          {...listeners}
          {...{
            className: header.column.getCanSort()
              ? "cursor-grab select-none"
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
        {/* <button className="ml-2 cursor-grab">🟰</button> */}
      </div>
    </TableHead>
  );
};

const DragAlongCell = <T,>({ cell }: { cell: Cell<T, unknown> }) => {
  const { isDragging, setNodeRef, transform } = useSortable({
    id: cell.column.id,
  });

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: "relative",
    transform: CSS.Translate.toString(transform),
    transition: "width transform 0.2s ease-in-out",
    width: cell.column.getSize(),
    minWidth: cell.column.getSize(),
    maxWidth: cell.column.getSize(),
    flex: `0 0 ${cell.column.getSize()}px`,
    zIndex: isDragging ? 1 : 0,
    boxSizing: "border-box",
  };

  return (
    <TableCell style={style} ref={setNodeRef}>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </TableCell>
  );
};

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ children, className, ...props }, ref) => (
    <thead
      ref={ref}
      data-slot="table-header"
      className={cn(
        "top-0 sticky bg-gray-200 [&_tr]:border-0 border-t border-b",
        className
      )}
      {...props}
    >
      {children}
    </thead>
  )
);
TableHeader.displayName = "TableHeader";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    {...props}
    className={cn(
      "group data-[state=selected]:bg-muted hover:bg-muted/50 p-20 px-2 [&_td]:border-0 [&_th]:border-0 border-b transition-colors",
      className
    )}
  />
));
TableRow.displayName = "TableRow";


 const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
   ({ children, className, ...props }, ref) => (
     <th
       ref={ref}
       data-slot="table-head"
       {...props}
       className={cn(
         "h-10 text-left align-middle font-medium text-muted-foreground border-0 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
         className
       )}
     >
       {children}
     </th>
   )
 );
TableHead.displayName = "TableHead";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    {...props}
    className={cn("[&_tr:last-child]:border-0", className)}
  />
));
TableBody.displayName = "TableBody";

 const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
   ({ children, className, ...props }, ref) => (
     <td
       ref={ref}
       data-slot="table-cell"
       {...props}
       className={cn(
         "py-3.5 align-middle whitespace-nowrap border-0 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
         className
       )}
     >
       {children}
     </td>
   )
 );
TableCell.displayName = "TableCell";

const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ children, className, ...props }, ref) => (
    <div
      data-slot="table-container"
      className={(cn("table relative w-fit max-h-10 overflow-auto overflow-auto border-collapse table-fixed", className))}
    >
      <table
        ref={ref}
                data-slot="table"
        className={cn("w-full border-collapse table-fixed", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  )
);
Table.displayName = "Table";

function IndeterminateCheckbox({
  indeterminate,
  className = "",
  ...rest
}: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
  const ref = React.useRef<HTMLInputElement>(null!);

  useEffect(() => {
    if (typeof indeterminate === "boolean") {
      ref.current.indeterminate = !rest.checked && indeterminate;
    }
  }, [ref, indeterminate]);

  return (  
    <input
      type="checkbox"
      ref={ref}
      className={className + " cursor-pointer"}
      {...rest}
    />
  );
}

interface DataTableProps<TData> {
  table: TanStackTable<TData>;
  columnOrder: string[];
  onColumnOrderChange: (columnOrder: string[]) => void;
  className?: string;
}

function DataTable<TData>({
  table,
  columnOrder,
  onColumnOrderChange,
  className,
}: DataTableProps<TData>) {
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      onColumnOrderChange(
        arrayMove(
          columnOrder,
          columnOrder.indexOf(active.id as string),
          columnOrder.indexOf(over.id as string)
        )
      );
    }
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis]}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <Table className={className}>
        <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => {
                     return <TableRow key={headerGroup.id}>
                          <SortableContext
                              items={columnOrder}
                              strategy={horizontalListSortingStrategy}
                          >
                              {headerGroup.headers.map((header) => (
                                  <DraggableTableHeader key={header.id} header={header} />
                              ))}
                          </SortableContext>
                      </TableRow>
                  })}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              <SortableContext
                items={columnOrder}
                strategy={horizontalListSortingStrategy}
              >
                {row.getVisibleCells().map((cell) => (
                  <DragAlongCell key={cell.id} cell={cell} />
                ))}
              </SortableContext>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DndContext>
  );
}

export {
  Table,
  TableRow,
  DataTable,
    TableHead,
  TableBody,
  TableCell,
  TableHeader,
  DraggableTableHeader,
  DragAlongCell,
  IndeterminateCheckbox,
  type DataTableProps,
};
import React, { CSSProperties, forwardRef, HTMLProps, useEffect } from "react";
import {
  Cell,
  ColumnDef,
  Header,
  flexRender,
  Table as TanStackTable,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  OnChangeFn,
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
        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          {header.isPlaceholder
            ? null
            : flexRender(header.column.columnDef.header, header.getContext())}
        </div>
        {!(header.column.columnDef as any).disableDrag && (
          <div
            {...attributes}
            {...listeners}
            className="hover:bg-gray-100 ml-2 p-1 rounded cursor-grab"
            title="Drag to reorder column"
          >
            🟰
          </div>
        )}
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
    <table
      ref={ref}
      data-slot="table"
      className={cn("w-full border-collapse table-fixed", className)}
      {...props}
    >
      {children}
    </table>
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
  data: TData[];
  columns: ColumnDef<TData>[];
  rowSelection: {};
  setRowSelection: React.Dispatch<React.SetStateAction<{}>>;
  sorting: SortingState;
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
  columnOrder: string[];
  setColumnOrder: (columnOrder: string[]) => void;
  isLoading: boolean;
  isTablet?: boolean;
  className?: string;
}

function DataTable<TData>({
  data,
  columns,
  rowSelection,
  setRowSelection,
  sorting,
  setSorting,
  columnOrder,
  setColumnOrder,
  isLoading,
  isTablet = false,
  className,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    state: {
      columnOrder,
      rowSelection,
      sorting,
    },
    enableRowSelection: true,
    enableSorting: true,
    onRowSelectionChange: setRowSelection,
    onColumnOrderChange: (updater) => {
      if (typeof updater === 'function') {
        setColumnOrder(updater(columnOrder));
      } else {
        setColumnOrder(updater);
      }
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualSorting: false,
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
  });

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    console.log("Sorting change called with:", updater);
    const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
    console.log("New sorting state:", newSorting);
    setSorting(newSorting);
    table.setPageIndex(0);
  };

  table.setOptions((prev) => ({
    ...prev,
    onSortingChange: handleSortingChange,
  }));

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setColumnOrder(
        arrayMove(
          columnOrder,
          columnOrder.indexOf(active.id as string),
          columnOrder.indexOf(over.id as string)
        )
      );
    }
  }

  const containerWidth = isTablet ? 'calc(100vw - 2rem)' : 'calc(100vw - 4rem)';
  const minTableWidth = isTablet ? '800px' : '1000px';

  return (
    <div className="w-full">
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToHorizontalAxis]}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <div
          className="relative border border-gray-300 rounded-lg"
          style={{
            width: containerWidth,
            height: "600px",
            overflow: "auto",
            minWidth: minTableWidth,
          }}
        >
          <div
            className="min-w-full"
            style={{
              minWidth: minTableWidth,
            }}
          >
            <Table className={cn("w-full", className)}>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => {
                  return (
                    <TableRow key={headerGroup.id}>
                      <SortableContext
                        items={columnOrder}
                        strategy={horizontalListSortingStrategy}
                      >
                        {headerGroup.headers.map((header) => (
                          <DraggableTableHeader key={header.id} header={header} />
                        ))}
                      </SortableContext>
                    </TableRow>
                  );
                })}
              </TableHeader>
              <TableBody>
                {table.getPaginationRowModel().rows.map((row) => (
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
          </div>
        </div>
      </DndContext>

      <div className="h-2" />
      <div className={`${isTablet ? 'flex-col space-y-2' : 'flex items-center gap-2'} overflow-x-auto`}>
        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            className="hover:bg-gray-50 disabled:opacity-50 p-2 border rounded"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            title="First page"
          >
            {"<<"}
          </button>
          <button
            className="hover:bg-gray-50 disabled:opacity-50 p-2 border rounded"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            title="Previous page"
          >
            {"<"}
          </button>
          <button
            className="hover:bg-gray-50 disabled:opacity-50 p-2 border rounded"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            title="Next page"
          >
            {">"}
          </button>
          <button
            className="hover:bg-gray-50 disabled:opacity-50 p-2 border rounded"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            title="Last page"
          >
            {">>"}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-sm">
            <div>Page</div>
            <strong>
              {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </strong>
          </span>

          <span className="flex items-center gap-1 text-sm">
            | Go to page:
            <input
              type="number"
              min="1"
              max={table.getPageCount()}
              defaultValue={table.getState().pagination.pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                table.setPageIndex(page);
              }}
              className="p-1 border rounded w-16 text-center"
            />
          </span>

          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "all") {
                table.setPageSize(table.getPreFilteredRowModel().rows.length);
              } else {
                table.setPageSize(Number(value));
              }
              table.setPageIndex(0);
            }}
            className="p-1 border rounded text-sm"
          >
            {[10, 20, 30, 40, 50, 100].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
            <option value="all">Show All</option>
          </select>
        </div>
      </div>

      <div className="mt-4 text-gray-600 text-sm">
        {Object.keys(rowSelection).length} of{" "}
        {table.getPreFilteredRowModel().rows.length} Total Rows Selected
      </div>
    </div>
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
import React, { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Table as TanStackTable,
} from "@tanstack/react-table";
import {
  keepPreviousData,
  useInfiniteQuery,
} from "@tanstack/react-query";
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
import { TableHead, TableCell, IndeterminateCheckbox } from "./table";

const VirtualizedDraggableTableHeader = ({
  header,
}: {
  header: Header<any, unknown>;
}) => {
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
    <th colSpan={header.colSpan} ref={setNodeRef} style={style}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div
          {...{
            className: header.column.getCanSort()
              ? 'cursor-pointer select-none'
              : '',
            onClick: header.column.getToggleSortingHandler(),
          }}
          style={{ flex: 1, display: 'flex', alignItems: 'center' }}
        >
          {header.isPlaceholder
            ? null
            : flexRender(header.column.columnDef.header, header.getContext())}
          {{
            asc: ' 🔼',
            desc: ' 🔽',
          }[header.column.getIsSorted() as string] ?? null}
        </div>
        <button {...attributes} {...listeners} style={{ marginLeft: '8px', cursor: 'grab' }}>
          🟰
        </button>
      </div>
    </th>
  );
};

const VirtualizedDragAlongCell = ({ cell }: { cell: Cell<any, unknown> }) => {
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
    <td style={style} ref={setNodeRef}>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  );
};

export interface VirtualizedTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  rowSelection: any;
  setRowSelection: (selection: any) => void;
  sorting: SortingState;
  setSorting: (sorting: SortingState | ((prev: SortingState) => SortingState)) => void;
  columnOrder: string[];
  setColumnOrder: (order: string[]) => void;
  isLoading?: boolean;
  containerHeight?: string;
  onFetchMore?: () => void;
  totalFetched?: number;
  totalDBRowCount?: number;
  isFetching?: boolean;
}

export function VirtualizedTable<TData>({
  data,
  columns,
  rowSelection,
  setRowSelection,
  sorting,
  setSorting,
  columnOrder,
  setColumnOrder,
  isLoading = false,
  containerHeight = "600px",
  onFetchMore,
  totalFetched = 0,
  totalDBRowCount = 0,
  isFetching = false,
}: VirtualizedTableProps<TData>) {
  const tableContainerRef = useRef<HTMLDivElement>(null);

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
    onColumnOrderChange: setColumnOrder,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualSorting: true,
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
  });

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    setSorting(updater);
    table.setPageIndex(0);
  };

  table.setOptions((prev) => ({
    ...prev,
    onSortingChange: handleSortingChange,
  }));

  const paginatedRows = table.getPaginationRowModel().rows;

  const rowVirtualizer = useVirtualizer({
    count: paginatedRows.length,
    estimateSize: () => 33,
    getScrollElement: () => tableContainerRef.current,
    measureElement:
      typeof window !== "undefined" &&
      navigator.userAgent.indexOf("Firefox") === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
  });

  const fetchMoreOnBottomReached = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement && onFetchMore) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
        if (
          scrollHeight - scrollTop - clientHeight < 500 &&
          !isFetching &&
          totalFetched < totalDBRowCount
        ) {
          onFetchMore();
        }
      }
    },
    [onFetchMore, isFetching, totalFetched, totalDBRowCount]
  );

  useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current);
  }, [fetchMoreOnBottomReached]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setColumnOrder((columnOrder) => {
        const oldIndex = columnOrder.indexOf(active.id as string);
        const newIndex = columnOrder.indexOf(over.id as string);
        return arrayMove(columnOrder, oldIndex, newIndex);
      });
    }
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  if (isLoading) {
    return <>Loading...</>;
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis]}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <div
        className="p-2 container"
        style={{ height: containerHeight, display: "flex", flexDirection: "column" }}
      >
        <div className="h-4" />
        <div className="h-4" />

        {/* Static Header */}
        <table
          style={{
            display: "table",
            width: "100%",
            tableLayout: "fixed",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                <SortableContext
                  items={columnOrder}
                  strategy={horizontalListSortingStrategy}
                >
                  {headerGroup.headers.map((header) => (
                    <VirtualizedDraggableTableHeader key={header.id} header={header} />
                  ))}
                </SortableContext>
              </tr>
            ))}
          </thead>
        </table>

        {/* Scrollable Body Container */}
        <div
          ref={tableContainerRef}
          style={{
            flex: 1,
            overflow: "auto",
            position: "relative",
          }}
        >
          <table
            style={{
              display: "table",
              width: "100%",
              tableLayout: "fixed",
              borderCollapse: "collapse",
            }}
          >
            <tbody
              style={{
                display: "block",
                height: `${rowVirtualizer.getTotalSize()}px`,
                position: "relative",
                overflow: "visible",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = paginatedRows[virtualRow.index];
                return (
                  <tr
                    key={row.id}
                    data-index={virtualRow.index}
                    ref={(node) => rowVirtualizer.measureElement(node)}
                    style={{
                      display: "flex",
                      width: "100%",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      transform: `translate3d(0, ${virtualRow.start}px, 0)`,
                      willChange: "transform",
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <SortableContext
                        key={cell.id}
                        items={columnOrder}
                        strategy={horizontalListSortingStrategy}
                      >
                        <VirtualizedDragAlongCell key={cell.id} cell={cell} />
                      </SortableContext>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer outside scrollable area */}
        <div style={{ marginTop: "10px" }}>
          <table
            style={{
              display: "table",
              width: "100%",
              tableLayout: "fixed",
              borderCollapse: "collapse",
            }}
          >
            <tfoot>
              <tr>
                <td className="p-1">
                  <IndeterminateCheckbox
                    {...{
                      checked: table.getIsAllPageRowsSelected(),
                      indeterminate: table.getIsSomePageRowsSelected(),
                      onChange: table.getToggleAllPageRowsSelectedHandler(),
                    }}
                  />
                </td>
                <td colSpan={20}>
                  Page Rows ({table.getPaginationRowModel().rows.length})
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="h-2" />
        <div className="flex items-center gap-2">
          <button
            className="p-1 border rounded"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {"<<"}
          </button>
          <button
            className="p-1 border rounded"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {"<"}
          </button>
          <button
            className="p-1 border rounded"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {">"}
          </button>
          <button
            className="p-1 border rounded"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {">>"}
          </button>
          <span className="flex items-center gap-1">
            <div>Page</div>
            <strong>
              {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </strong>
          </span>
          <span className="flex items-center gap-1">
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
              className="p-1 border rounded w-16"
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
          >
            {[10, 20, 30, 40, 50, 100].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
            <option value="all">Show All</option>
          </select>
        </div>
        <br />
        <div>
          {Object.keys(rowSelection).length} of{" "}
          {table.getPreFilteredRowModel().rows.length} Total Rows Selected
        </div>
      </div>
    </DndContext>
  );
}

export { VirtualizedDraggableTableHeader, VirtualizedDragAlongCell };
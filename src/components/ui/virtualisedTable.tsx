import { CSSProperties, useCallback, useEffect, useRef } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./Table";
import { TableFooter } from "../data-table/Footer";

const VirtualizedDraggableTableHeader = ({
  header,
}: {
  header: Header<any, unknown>;
}) => {
  const disableDrag = (header.column.columnDef as any).disableDrag ?? false;
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useSortable({
      id: header.column.id,
      disabled: disableDrag,
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
        {...(!disableDrag ? { ...attributes, ...listeners } : {})}
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
      </div>
    </TableHead>
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
    <TableCell style={style} ref={setNodeRef}>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </TableCell>
  );
};

export interface VirtualizedTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  rowSelection: any;
  setRowSelection: (selection: any) => void;
  sorting: SortingState;
  setSorting: (
    sorting: SortingState | ((prev: SortingState) => SortingState)
  ) => void;
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
    initialState: {
      pagination: {
        pageSize: 20,
      },
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
    estimateSize: () => 47,
    getScrollElement: () => tableContainerRef.current,
    measureElement: undefined,
    overscan: 10,
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
      <div className="w-full">
        {/* Message for mobile users */}
        <div className="md:hidden block p-6 text-gray-600 text-center">
          This table can only be viewed on tablet or desktop devices.
        </div>

        <div className="hidden md:flex flex-col w-full">
          {/* Shared scroll container for horizontal scroll sync */}
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <Table className="w-full border-collapse table-fixed">
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      <SortableContext
                        items={columnOrder}
                        strategy={horizontalListSortingStrategy}
                      >
                        {headerGroup.headers.map((header) => (
                          <VirtualizedDraggableTableHeader
                            key={header.id}
                            header={header}
                          />
                        ))}
                      </SortableContext>
                    </TableRow>
                  ))}
                </TableHeader>
              </Table>
            </div>

            <div
              ref={tableContainerRef}
              className="overflow-y-auto"
              style={{ height: containerHeight }}
            >
              <div className="min-w-full">
                <Table className="w-full border-collapse table-fixed">
                  <TableBody>
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                      const row = paginatedRows[virtualRow.index];
                      return (
                        <TableRow
                          key={row.id}
                          data-index={virtualRow.index}
                          data-state={
                            row.getIsSelected() ? "selected" : undefined
                          }
                          style={{
                            backgroundColor: row.getIsSelected()
                              ? "hsl(220 14.3% 95.9%)"
                              : undefined,
                          }}
                          onMouseEnter={(e) => {
                            if (!row.getIsSelected())
                              e.currentTarget.style.backgroundColor =
                                "hsl(220 14.3% 95.9% / 0.5)";
                          }}
                          onMouseLeave={(e) => {
                            if (!row.getIsSelected())
                              e.currentTarget.style.backgroundColor = "";
                          }}
                          ref={(node) => rowVirtualizer.measureElement(node)}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <SortableContext
                              key={cell.id}
                              items={columnOrder}
                              strategy={horizontalListSortingStrategy}
                            >
                              <VirtualizedDragAlongCell
                                key={cell.id}
                                cell={cell}
                              />
                            </SortableContext>
                          ))}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <TableFooter table={table} />

          <div className="p-2 text-gray-500 text-sm">
            {Object.keys(rowSelection).length} of{" "}
            {table.getPreFilteredRowModel().rows.length} total rows selected
          </div>
        </div>
      </div>
    </DndContext>
  );
}

export { VirtualizedDraggableTableHeader, VirtualizedDragAlongCell };

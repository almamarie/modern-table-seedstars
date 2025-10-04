import React, { CSSProperties, HTMLProps, useEffect, useState } from "react";
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
import { fetchData, Person, PersonApiResponse } from "../makeData";

import {
  keepPreviousData,
  useInfiniteQuery,
} from "@tanstack/react-query";
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
} from "@dnd-kit/sortable";

// needed for row & cell level scope DnD setup
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const fetchSize = 100;

const DraggableTableHeader = ({
  header,
}: {
  header: Header<Person, unknown>;
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

const DragAlongCell = ({ cell }: { cell: Cell<Person, unknown> }) => {
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
    zIndex: isDragging ? 1 : 0,
    boxSizing: "border-box",
  };

  return (
    <td style={style} ref={setNodeRef}>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  );
};

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

export default function ModernTable() {
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns = React.useMemo<ColumnDef<Person>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler(),
            }}
          />
        ),
        cell: ({ row }) => (
          <div>
            <IndeterminateCheckbox
              {...{
                checked: row.getIsSelected(),
                disabled: !row.getCanSelect(),
                indeterminate: row.getIsSomeSelected(),
                onChange: row.getToggleSelectedHandler(),
              }}
            />
          </div>
        ),
        size: 50,
      },
      {
        accessorKey: "#",
        cell: (info) => info.row.index,
        id: "index",
        size: 50,
      },
      {
        accessorKey: "firstName",
        cell: (info) => info.getValue(),
        id: "firstName",
        size: 150,
      },
      {
        accessorFn: (row) => row.lastName,
        cell: (info) => info.getValue(),
        header: () => <span>Last Name</span>,
        id: "lastName",
        size: 150,
      },
      {
        accessorKey: "age",
        header: () => "Age",
        id: "age",
        size: 120,
      },
      {
        accessorKey: "visits",
        header: () => <span>Visits</span>,
        id: "visits",
        size: 120,
      },
      {
        accessorKey: "status",
        header: "Status",
        id: "status",
        size: 150,
      },
      {
        accessorKey: "progress",
        header: "Profile Progress",
        id: "progress",
        size: 180,
      },
    ],
    []
  );

  const { data, isLoading } =
    useInfiniteQuery<PersonApiResponse>({
      queryKey: [
        "people",
        sorting,
      ],
      queryFn: async ({ pageParam = 0 }) => {
        const start = (pageParam as number) * fetchSize;
        const fetchedData = await fetchData(start, fetchSize, sorting);
        return fetchedData;
      },
      initialPageParam: 0,
      getNextPageParam: (_lastGroup, groups) => groups.length,
      refetchOnWindowFocus: false,
      placeholderData: keepPreviousData,
    });

  const flatData = React.useMemo(
    () => data?.pages?.flatMap((page) => page.data) ?? [],
    [data]
  );

  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    columns.map((c) => c.id!)
  );

  const table = useReactTable({
    data: flatData,
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

  // reorder columns after drag & drop
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
    <div>
      <h1 className="text-2xl font-bold mb-4">Modern Table (Without Virtualization)</h1>
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToHorizontalAxis]}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <div className="p-2 container">
          <div className="h-4" />
          <div className="h-4" />

          <div
            style={{
              overflow: "auto",
              position: "relative",
              height: "600px",
              border: "1px solid #ccc",
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
              <thead style={{ position: "sticky", top: 0, backgroundColor: "white", zIndex: 1 }}>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    <SortableContext
                      items={columnOrder}
                      strategy={horizontalListSortingStrategy}
                    >
                      {headerGroup.headers.map((header) => (
                        <DraggableTableHeader key={header.id} header={header} />
                      ))}
                    </SortableContext>
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getPaginationRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <SortableContext
                        key={cell.id}
                        items={columnOrder}
                        strategy={horizontalListSortingStrategy}
                      >
                        <DragAlongCell key={cell.id} cell={cell} />
                      </SortableContext>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot style={{ position: "sticky", bottom: 0, backgroundColor: "white", zIndex: 1 }}>
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
    </div>
  );
}
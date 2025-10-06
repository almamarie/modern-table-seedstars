import { useMemo, useState } from "react";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { fetchData, Person, PersonApiResponse } from "../makeData";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { VirtualizedTable } from "../components/ui/virtualisedTable";
import { IndeterminateCheckbox } from "../components/ui/Table";
import { Actions } from "../components/Actions";
import UserAvatar from "../components/userAvatar";
import { usePersistedColumnOrder } from "../hooks/useColumnOrder";
import { SortableHeader } from "../components/SortableHeader";
import { NotepadText } from "lucide-react";
import ApplicationStatus from "../components/ApplicationStatus";
import { STATUS } from "../enum";

const fetchSize = 100;

export default function VirtualizedModernTable() {
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);

  // Bulk action functions
  const handleBulkAccept = () => {
    const selectedRows = Object.keys(rowSelection);
    console.log("Accepting rows:", selectedRows);
    // Add your bulk accept logic here
    setRowSelection({});
  };

  const handleBulkDecline = () => {
    const selectedRows = Object.keys(rowSelection);
    console.log("Declining rows:", selectedRows);

    setRowSelection({});
  };

  const columns = useMemo<ColumnDef<Person>[]>(
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
        size: 30,
        disableDrag: true,
      },
      {
        accessorKey: "#",
        cell: (info) => info.row.index,
        id: "index",
        size: 30,
        disableDrag: true,
        enableSorting: false,
      },
      {
        accessorKey: "Avatar",
        header: "Avatar",
        cell: ({ row }) => <UserAvatar name={row.getValue("name")} />,
        disableDrag: true,
        enableSorting: false,
        size: 50,
      },
      {
        accessorKey: "name",
        cell: (info) => (
          <span className="text-indigo-500">{info.getValue() as string}</span>
        ),
        id: "name",
        size: 80,
      },
      {
        accessorKey: "email",
        header: () => "Email",
        id: "email",
        cell: ({ row }) => {
          const email = row.original.email;
          return (
            <a
              href={`mailto:${email}`}
              className="text-indigo-500 hover:underline"
            >
              {email}
            </a>
          );
        },
        size: 100,
      },
      // {
      //   accessorKey: "age",
      //   header: () => "Age",
      //   id: "age",
      //   size: 50,
      // },
      {
        accessorKey: "status",
        header: () => "status",
        cell: (info) => (
          <ApplicationStatus status={info.getValue() as STATUS} />
        ),
        id: "status",
        size: 50,
      },

      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <SortableHeader column={column} title="Application Date" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <NotepadText className="w-5 h-5 text-indigo-500 text-primary" />
            <span>{row.getValue("createdAt")}</span>
          </div>
        ),
        enableSorting: true,
        size: 100,
      },
      {
        accessorKey: "actions",
        header: "",
        cell: ({ row }) => <Actions row={row} />,
        disableDrag: true,
        size: 50,
      },
    ],
    []
  );

  const { data, fetchNextPage, isFetching, isLoading } =
    useInfiniteQuery<PersonApiResponse>({
      queryKey: [
        "people",
        sorting, //refetch when sorting changes
      ],
      queryFn: async ({ pageParam = 0 }) => {
        const start = (pageParam as number) * fetchSize;
        const fetchedData = await fetchData(start, fetchSize, sorting); //pretend api call
        return fetchedData;
      },
      initialPageParam: 0,
      getNextPageParam: (_lastGroup, groups) => groups.length,
      refetchOnWindowFocus: false,
      placeholderData: keepPreviousData,
    });

  const flatData = useMemo(
    () => data?.pages?.flatMap((page) => page.data) ?? [],
    [data]
  );
  const totalDBRowCount = data?.pages?.[0]?.meta?.totalRowCount ?? 0;
  const totalFetched = flatData.length;

  const [columnOrder, setColumnOrder] = usePersistedColumnOrder([
    "select",
    "index",
    "createdAt",
    "Avatar",
    "name",
    "email",
    // "age",
    "status",
    "actions",
  ]);

  if (isLoading) {
    return <>Loading...</>;
  }

  console.log("Data size: ", flatData.length);
  const hasSelection = Object.keys(rowSelection).length > 0;

  return (
    <div>
      <h1 className="mb-4 font-bold text-2xl">Virtualized Modern Table</h1>

      {/* Bulk Actions */}
      {hasSelection && (
        <div className="">
          <div className="mb-4">
            <div className="flex gap-2">
              <button
                onClick={handleBulkAccept}
                className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white text-sm"
              >
                Accept
              </button>
              <button
                onClick={handleBulkDecline}
                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white text-sm"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
      <VirtualizedTable
        data={flatData}
        columns={columns}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        sorting={sorting}
        setSorting={setSorting}
        columnOrder={columnOrder}
        setColumnOrder={setColumnOrder}
        isLoading={isLoading}
        containerHeight="600px"
        onFetchMore={fetchNextPage}
        totalFetched={totalFetched}
        totalDBRowCount={totalDBRowCount}
        isFetching={isFetching}
      />
    </div>
  );
}

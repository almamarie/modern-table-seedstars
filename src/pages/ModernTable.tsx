import { useMemo, useState } from "react";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { fetchData, Person, PersonApiResponse } from "../makeData";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { DataTable, IndeterminateCheckbox } from "../components/ui/table";
import { Actions } from "../components/Actions";
import UserAvatar from "../components/userAvatar";
import { usePersistedColumnOrder } from "../hooks/useColumnOrder";
import { useResponsive } from "../hooks/useResponsive";
import { SortableHeader } from "../components/SortableHeader";
import { NotepadText } from "lucide-react";
import ApplicationStatus from "../components/ApplicationStatus";
import { STATUS } from "../enum";
import MobileMessage from "../components/MobileMessage";

const fetchSize = 200;

export default function ModernTable() {
  const { isMobile, isTablet } = useResponsive();
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [bulkActionMessage, setBulkActionMessage] = useState("");

  // Bulk action functions
  const handleBulkAccept = () => {
    const selectedRows = Object.keys(rowSelection);
    console.log("Accepting rows:", selectedRows);
    // Change to api
    setBulkActionMessage(`${selectedRows.length} Applications accepted`);
    setRowSelection({});
  };

  const handleBulkDecline = () => {
    const selectedRows = Object.keys(rowSelection);
    console.log("Declining rows:", selectedRows);
    // Change to api
    setBulkActionMessage(`${selectedRows.length} Applications declined`);
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
        cell: (info) => info.row.index + 1,
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
        // size: 80,
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
              className="text-indigo-500 hover:underline truncate"
            >
              {email}
            </a>
          );
        },
        // size: 100,
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <SortableHeader column={column} title="Status" />
        ),
        cell: (info) => (
          <ApplicationStatus status={info.getValue() as STATUS} />
        ),
        id: "status",
        // size: 50,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <SortableHeader column={column} title="Timestamp" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <NotepadText className="w-5 h-5 text-indigo-500 text-primary" />
            <span className="truncate">{row.getValue("createdAt")}</span>
          </div>
        ),
        enableSorting: true,
        disableDrag: true,
        // size: 100,
      },
      {
        accessorKey: "actions",
        header: "",
        cell: ({ row }) => <Actions row={row} />,
        disableDrag: true,
        // size: 50,
      },
    ],
    []
  );

  const { data, isLoading } = useInfiniteQuery<PersonApiResponse>({
    queryKey: [
      "people",
      sorting, //refetch when sorting changes
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

  const flatData = useMemo(
    () => data?.pages?.flatMap((page) => page.data) ?? [],
    [data]
  );

  const [columnOrder, setColumnOrder] = usePersistedColumnOrder([
    "select",
    "index",
    "createdAt",
    "Avatar",
    "name",
    "email",
    "status",
    "actions",
  ]);

  if (isLoading) {
    return <>Loading...</>;
  }

  // Show mobile message for screens smaller than 768px
  if (isMobile) {
    return <MobileMessage />;
  }

  console.log("Data size: ", flatData.length);
  const hasSelection = Object.keys(rowSelection).length > 0;

  return (
    <div className="w-full">
      <div className={`${isTablet ? "px-4" : "px-8"} w-full`}>
        <h1 className="mb-4 font-bold text-2xl">
          Modern Table (Without Virtualization)
        </h1>

        {/* Bulk Actions */}
        {hasSelection && (
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
        )}
      </div>

      <div className={`w-full ${isTablet ? "px-4" : "px-8"}`}>
        <DataTable
          data={flatData}
          columns={columns}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          sorting={sorting}
          setSorting={setSorting}
          columnOrder={columnOrder}
          setColumnOrder={setColumnOrder}
          isLoading={isLoading}
          isTablet={isTablet}
        />
        <span>{bulkActionMessage}</span>
      </div>
    </div>
  );
}

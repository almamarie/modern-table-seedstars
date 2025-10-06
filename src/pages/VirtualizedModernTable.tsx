import { useMemo, useState } from "react";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { fetchData, Person, PersonApiResponse } from "../makeData";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { VirtualizedTable } from "../components/ui/virtualisedTable";
import { IndeterminateCheckbox } from "../components/ui/table";

const fetchSize = 100;

export default function VirtualizedModernTable() {
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);

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
        size: 50,
        disableDrag: true,
      },
      {
        accessorKey: "#",
        cell: (info) => info.row.index,
        id: "index",
        size: 50,
        disableDrag: true,
      },
      {
        accessorKey: "firstName",
        cell: (info) => info.getValue(),
        id: "firstName",
      },
      {
        accessorFn: (row) => row.lastName,
        cell: (info) => info.getValue(),
        header: () => <span>Last Name</span>,
        id: "lastName",
      },
      {
        accessorKey: "age",
        header: () => "Age",
        id: "age",
      },
      {
        accessorKey: "visits",
        header: () => <span>Visits</span>,
        id: "visits",
      },
      {
        accessorKey: "status",
        header: "Status",
        id: "status",
      },
      {
        accessorKey: "progress",
        header: "Profile Progress",
        id: "progress",
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

  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    columns.map((c) => c.id!)
  );

  if (isLoading) {
    return <>Loading...</>;
  }

  console.log("Data size: ", flatData.length);
  return (
    <div>
      <h1 className="mb-4 font-bold text-2xl">Virtualized Modern Table</h1>
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

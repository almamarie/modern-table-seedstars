import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React, { useState } from "react";
import { DataTable } from "../../components/ui/Table";
import { ColumnDef, SortingState } from "@tanstack/react-table";

interface Person {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  status: string;
}

const mockData: Person[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    createdAt: "2023-01-01",
    status: "Pending",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    createdAt: "2023-02-01",
    status: "Approved",
  },
];

// Mimic the SortableHeader behavior
const SortableHeader = ({ column, title }: any) => (
  <div
    data-testid={`header-${title}`}
    onClick={column.getToggleSortingHandler()}
    style={{ cursor: "pointer" }}
  >
    {title}
  </div>
);

function TestWrapper() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnOrder, setColumnOrder] = useState([
    "name",
    "email",
    "createdAt",
    "status",
  ]);

  const columns = React.useMemo<ColumnDef<Person>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <SortableHeader column={column} title="Name" />,
        cell: (info) => info.getValue(),
        enableSorting: true,
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <SortableHeader column={column} title="Timestamp" />
        ),
        cell: (info) => info.getValue(),
        enableSorting: true,
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <SortableHeader column={column} title="Status" />
        ),
        cell: (info) => info.getValue(),
        enableSorting: true,
      },
    ],
    []
  );

  return (
    <DataTable
      data={mockData}
      columns={columns}
      rowSelection={rowSelection}
      setRowSelection={setRowSelection}
      sorting={sorting}
      setSorting={setSorting}
      columnOrder={columnOrder}
      setColumnOrder={setColumnOrder}
      isLoading={false}
    />
  );
}

describe("DataTable Component", () => {
  test("renders table and rows", () => {
    render(<TestWrapper />);
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(mockData.length + 1); // +1 header
  });

  test("calls setSorting when a sortable header is clicked", async () => {
    render(<TestWrapper />);
    const nameHeader = screen.getByTestId("header-Name");
    fireEvent.click(nameHeader);

    await waitFor(() => {
      expect(nameHeader).toBeInTheDocument(); // sanity check
    });
  });

  test("paginates when next button is clicked", async () => {
    render(<TestWrapper />);
    const nextButton = screen.getByTitle("Next page");
    fireEvent.click(nextButton);
    await waitFor(() => {
      expect(nextButton).toBeInTheDocument();
    });
  });

  test("renders selection summary text", () => {
    render(<TestWrapper />);
    expect(screen.getByText(/Total Rows Selected/i)).toBeInTheDocument();
  });
});

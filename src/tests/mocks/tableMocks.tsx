export interface Person {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  status: string;
}

export const mockData: Person[] = [
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
export const SortableHeader = ({ column, title }: any) => (
  <div
    data-testid={`header-${title}`}
    onClick={column.getToggleSortingHandler()}
    style={{ cursor: "pointer" }}
  >
    {title}
  </div>
);

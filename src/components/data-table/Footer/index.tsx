import { Table } from "@tanstack/react-table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Pagination } from "./Pagination";

export function TableFooter<TData>({ table }: { table: Table<TData> }) {
  return (
    <div className="flex justify-between items-center p-5 py-10">
      <div className="flex-1 text-muted-foreground text-sm">
        {table.getFilteredSelectedRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value: any) => {
              if (value === "All") {
                console.log(
                  "Roes changed: ",
                  table.getFilteredRowModel().rows.length
                );
                table.setPageSize(table.getFilteredRowModel().rows.length);
                return;
              }
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="w-[70px] h-8">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[20, 30, 40, 50, "All"].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-center items-center w-[100px] font-medium text-sm">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <Pagination table={table} />
      </div>
    </div>
  );
}
